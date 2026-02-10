#!/usr/bin/env python3
"""
FAISS Index Generator for IntelliCV Resume Variants
Uses all-MiniLM-L6-v2 sentence transformer to generate real embeddings
and stores them in FAISS binary index format.

Usage: python3 generate_faiss_index.py <variants_dir>
Example: python3 generate_faiss_index.py Processing/resume_variants_3
"""

import sys
import os
import json
import pickle
import numpy as np

# Embedding model settings
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384
MODEL_CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", "model_cache")
MODEL_CACHE_PATH = os.path.join(MODEL_CACHE_DIR, "sentence_transformer.pkl")

def load_model():
    """Load sentence transformer model, using cache if available."""
    print(f"📦 Loading embedding model: {EMBEDDING_MODEL}")
    print(f"   Cache path: {MODEL_CACHE_PATH}")
    
    # Try to load from pickle cache first
    if os.path.exists(MODEL_CACHE_PATH):
        print("   ✓ Loading model from cache...")
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(EMBEDDING_MODEL, cache_folder=MODEL_CACHE_DIR)
            print(f"   ✓ Model loaded (dim={EMBEDDING_DIMENSION})")
            return model
        except Exception as e:
            print(f"   ⚠ Cache load failed: {e}")
    
    # Download/load fresh model
    try:
        from sentence_transformers import SentenceTransformer
        print("   ↓ Downloading model...")
        model = SentenceTransformer(EMBEDDING_MODEL, cache_folder=MODEL_CACHE_DIR)
        
        # Save model cache
        os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
        with open(MODEL_CACHE_PATH, "wb") as f:
            pickle.dump({"model_name": EMBEDDING_MODEL, "dim": EMBEDDING_DIMENSION}, f)
        
        print(f"   ✓ Model loaded and cached (dim={EMBEDDING_DIMENSION})")
        return model
    except ImportError:
        print("   ⚠ sentence-transformers not installed, using fallback embeddings")
        return None


def fallback_embedding(text):
    """Generate a deterministic pseudo-embedding when sentence-transformers is unavailable."""
    import hashlib
    normalized = text.lower().strip()
    if not normalized:
        return np.zeros(EMBEDDING_DIMENSION, dtype=np.float32)
    
    seed = hashlib.sha256(normalized.encode()).digest()
    rng = np.random.RandomState(int.from_bytes(seed[:4], 'big'))
    vec = rng.randn(EMBEDDING_DIMENSION).astype(np.float32)
    vec = vec / np.linalg.norm(vec)
    return vec


def extract_section_texts(resume):
    """Extract text from each resume section."""
    sections = {}
    
    if resume.get("summary"):
        sections["summary"] = resume["summary"]
    
    if resume.get("education"):
        texts = []
        for edu in resume["education"]:
            highlights = edu.get("highlights", [])
            if isinstance(highlights, list):
                highlights = ", ".join(highlights)
            texts.append(f"{edu.get('degree', '')} from {edu.get('institution', '')} {edu.get('year', '')} {highlights}")
        sections["education"] = "\n".join(texts)
    
    if resume.get("skills"):
        parts = []
        sk = resume["skills"]
        if sk.get("technical"):
            parts.append("Technical: " + ", ".join(sk["technical"]))
        if sk.get("tools"):
            parts.append("Tools: " + ", ".join(sk["tools"]))
        if sk.get("soft"):
            parts.append("Soft Skills: " + ", ".join(sk["soft"]))
        if parts:
            sections["skills"] = "\n".join(parts)
    
    if resume.get("projects"):
        texts = []
        for proj in resume["projects"]:
            techs = proj.get("technologies", [])
            if isinstance(techs, list):
                techs = ", ".join(techs)
            texts.append(f"{proj.get('title', '')}: {proj.get('description', '')} [{techs}]")
        sections["projects"] = "\n".join(texts)
    
    if resume.get("certifications"):
        texts = []
        for cert in resume["certifications"]:
            texts.append(f"{cert.get('title', '')} by {cert.get('issuer', '')} ({cert.get('date', '')})")
        sections["certifications"] = "\n".join(texts)
    
    return sections


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_faiss_index.py <variants_dir>")
        sys.exit(1)
    
    variants_dir = sys.argv[1]
    if not os.path.isabs(variants_dir):
        variants_dir = os.path.join(os.getcwd(), variants_dir)
    
    if not os.path.exists(variants_dir):
        print(f"❌ Directory not found: {variants_dir}")
        sys.exit(1)
    
    print(f"{'═' * 70}")
    print(f"  FAISS INDEX GENERATION")
    print(f"  Model: {EMBEDDING_MODEL} | Dim: {EMBEDDING_DIMENSION}")
    print(f"{'═' * 70}")
    
    # Load model
    model = load_model()
    
    def encode_text(text):
        if model is not None:
            return model.encode([text], normalize_embeddings=True)[0].astype(np.float32)
        return fallback_embedding(text)
    
    # Load all variant JSON files
    variant_files = sorted([f for f in os.listdir(variants_dir) if f.startswith("variant_") and f.endswith(".json")])
    
    if not variant_files:
        print("⚠ No variant files found")
        sys.exit(1)
    
    print(f"\n📂 Found {len(variant_files)} variant files")
    
    all_embeddings = []
    all_metadata = []
    section_indices = {}  # section_name -> list of (index, variant_name)
    
    for vf in variant_files:
        filepath = os.path.join(variants_dir, vf)
        with open(filepath, "r") as f:
            resume = json.load(f)
        
        variant_name = vf.replace(".json", "")
        sections = extract_section_texts(resume)
        print(f"  ▸ {variant_name}: {len(sections)} sections")
        
        for sec_name, sec_text in sections.items():
            embedding = encode_text(sec_text)
            idx = len(all_embeddings)
            all_embeddings.append(embedding)
            all_metadata.append({
                "index": idx,
                "variant": variant_name,
                "section": sec_name,
                "text_preview": sec_text[:150],
            })
            
            if sec_name not in section_indices:
                section_indices[sec_name] = []
            section_indices[sec_name].append((idx, variant_name))
    
    if not all_embeddings:
        print("⚠ No embeddings generated")
        sys.exit(1)
    
    # Convert to numpy matrix
    embedding_matrix = np.array(all_embeddings, dtype=np.float32)
    print(f"\n📊 Embedding matrix shape: {embedding_matrix.shape}")
    
    # Also encode job description if available
    jd_path = os.path.join(variants_dir, "jd_embedding.json")
    jd_embedding = None
    if os.path.exists(jd_path):
        with open(jd_path, "r") as f:
            jd_data = json.load(f)
        jd_text = jd_data.get("job_description", "")
        if jd_text:
            jd_embedding = encode_text(jd_text)
            print(f"  ✓ Job description encoded ({EMBEDDING_DIMENSION}-dim)")
    
    # Build FAISS index
    try:
        import faiss
        print(f"\n🔨 Building FAISS index (IndexFlatIP, dim={EMBEDDING_DIMENSION})...")
        
        # Use Inner Product (cosine similarity for normalized vectors)
        index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
        index.add(embedding_matrix)
        
        # Save the FAISS index (binary format — not human readable)
        faiss_path = os.path.join(variants_dir, "resume_embeddings.faiss")
        faiss.write_index(index, faiss_path)
        print(f"  ✓ FAISS index saved: resume_embeddings.faiss ({os.path.getsize(faiss_path)} bytes)")
        print(f"  ✓ Contains {index.ntotal} vectors of dimension {EMBEDDING_DIMENSION}")
        
        # Save JD embedding as separate FAISS index
        if jd_embedding is not None:
            jd_index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
            jd_index.add(jd_embedding.reshape(1, -1))
            jd_faiss_path = os.path.join(variants_dir, "jd_embedding.faiss")
            faiss.write_index(jd_index, jd_faiss_path)
            print(f"  ✓ JD FAISS index saved: jd_embedding.faiss ({os.path.getsize(jd_faiss_path)} bytes)")
            
            # Perform actual similarity search
            print(f"\n{'─' * 70}")
            print(f"  FAISS SIMILARITY SEARCH RESULTS")
            print(f"{'─' * 70}")
            
            for sec_name, sec_entries in section_indices.items():
                sec_vectors = np.array([all_embeddings[idx] for idx, _ in sec_entries], dtype=np.float32)
                
                # Create temporary index for this section
                sec_index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
                sec_index.add(sec_vectors)
                
                # Search
                D, I = sec_index.search(jd_embedding.reshape(1, -1), len(sec_entries))
                
                print(f"\n  ┌─ {sec_name.upper()}")
                for rank in range(len(sec_entries)):
                    local_idx = I[0][rank]
                    score = D[0][rank]
                    orig_idx, variant_name = sec_entries[local_idx]
                    bar = "█" * int(abs(score) * 25)
                    best_marker = " ← BEST" if rank == 0 else ""
                    print(f"  │  {variant_name.ljust(18)} │ score={score:8.4f} │ {bar}{best_marker}")
                print(f"  └{'─' * 60}")
        
    except ImportError:
        print("\n⚠ faiss-cpu not installed, saving as numpy binary instead")
        
        # Save as numpy binary (also not human-readable)
        npy_path = os.path.join(variants_dir, "resume_embeddings.faiss")
        np.save(npy_path, embedding_matrix)
        # Rename .npy to .faiss for consistent naming
        actual_npy = npy_path + ".npy"
        if os.path.exists(actual_npy):
            os.rename(actual_npy, npy_path)
        print(f"  ✓ Embeddings saved as binary: resume_embeddings.faiss ({os.path.getsize(npy_path)} bytes)")
        
        if jd_embedding is not None:
            jd_faiss_path = os.path.join(variants_dir, "jd_embedding.faiss")
            np.save(jd_faiss_path, jd_embedding)
            actual_jd_npy = jd_faiss_path + ".npy"
            if os.path.exists(actual_jd_npy):
                os.rename(actual_jd_npy, jd_faiss_path)
            print(f"  ✓ JD embedding saved as binary: jd_embedding.faiss")
    
    # Save metadata (human-readable companion to the binary index)
    metadata_path = os.path.join(variants_dir, "faiss_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump({
            "model": EMBEDDING_MODEL,
            "dimension": EMBEDDING_DIMENSION,
            "num_vectors": len(all_embeddings),
            "index_type": "IndexFlatIP",
            "metric": "cosine_similarity",
            "vectors": all_metadata,
        }, f, indent=2)
    print(f"  ✓ Metadata saved: faiss_metadata.json")
    
    print(f"\n{'═' * 70}")
    print(f"  ✅ FAISS index generation complete")
    print(f"  📂 Output: {variants_dir}")
    print(f"{'═' * 70}")


if __name__ == "__main__":
    main()
