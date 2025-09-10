"""
Vector Service for ChromaDB operations and RAG functionality
Handles vector storage, retrieval, and knowledge base management
"""

import chromadb
from chromadb.config import Settings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from typing import List
from config.settings import settings


class VectorService:
    """Service for managing ChromaDB operations and RAG functionality"""
    
    def __init__(self):
        """Initialize ChromaDB client and embeddings"""
        self.client = chromadb.Client(Settings(anonymized_telemetry=False))
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.embedding_model)
        self.collection_name = settings.chroma_collection_name
        self.vectorstore = None
        self._setup_knowledge_base()
    
    def _setup_knowledge_base(self):
        """Initialize ChromaDB with sample knowledge base"""
        try:
            # Delete existing collection if it exists
            try:
                self.client.delete_collection(self.collection_name)
            except:
                pass
            
            # Create new collection
            collection = self.client.create_collection(self.collection_name)
            
            # Sample knowledge base documents
            documents = [
                "Artificial Intelligence is transforming industries through machine learning, natural language processing, and computer vision technologies.",
                "Hydroponic systems allow plants to grow without soil by providing nutrients directly through water solutions.",
                "Regular exercise improves cardiovascular health, strengthens muscles, and enhances mental well-being.",
                "Effective time management involves prioritizing tasks, setting clear goals, and eliminating distractions.",
                "Proper nutrition includes a balanced diet with fruits, vegetables, lean proteins, and whole grains.",
                "Mental health is as important as physical health and requires attention, care, and professional support when needed.",
                "Sustainable living practices help protect the environment and conserve resources for future generations.",
                "Continuous learning and skill development are essential for personal and professional growth in today's rapidly changing world."
            ]
            
            # Add documents to ChromaDB
            for i, doc in enumerate(documents):
                collection.add(
                    documents=[doc],
                    ids=[f"doc_{i}"],
                    metadatas=[{"source": f"knowledge_base_{i}"}]
                )
            
            self.vectorstore = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings
            )
            
        except Exception as e:
            print(f"ChromaDB setup error: {e}")
            self.vectorstore = None
    
    def retrieve_relevant_docs(self, query: str, k: int = 3) -> List[str]:
        """Retrieve relevant documents from ChromaDB"""
        if not self.vectorstore:
            return []
        
        try:
            docs = self.vectorstore.similarity_search(query, k=k)
            return [doc.page_content for doc in docs]
        except Exception as e:
            print(f"Retrieval error: {e}")
            return []
    
    def add_document(self, content: str, metadata: dict = None):
        """Add a new document to the knowledge base"""
        if not self.vectorstore:
            return False
        
        try:
            collection = self.client.get_collection(self.collection_name)
            doc_id = f"doc_{len(collection.get()['ids'])}"
            collection.add(
                documents=[content],
                ids=[doc_id],
                metadatas=[metadata or {"source": "user_added"}]
            )
            return True
        except Exception as e:
            print(f"Document addition error: {e}")
            return False
