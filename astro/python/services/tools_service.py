"""
Tools Service containing all demo tools with built-in data
Provides 5 demo tools: blog, health, hydroponics, tips, and fun facts
"""

import random
from typing import Tuple, List


class ToolsService:
    """Service containing all demo tools with example data"""
    
    def __init__(self):
        """Initialize tools service"""
        pass
    
    def blog_tool(self, query: str) -> str:
        """Generate blog title suggestions and content ideas"""
        blog_data = {
            "ai": ["10 AI Trends That Will Shape 2025", "Building Your First AI Chatbot", "The Future of Machine Learning"],
            "health": ["5 Morning Habits for Better Health", "Nutrition Myths Debunked", "Mental Health in the Digital Age"],
            "technology": ["Cloud Computing Best Practices", "Cybersecurity for Small Businesses", "The Rise of Edge Computing"],
            "productivity": ["Time Management Techniques That Actually Work", "Building Better Habits", "The Art of Deep Work"]
        }
        
        query_lower = query.lower()
        for category, titles in blog_data.items():
            if category in query_lower:
                return f"Blog suggestions for {category}: {', '.join(titles[:2])}"
        
        return "General blog ideas: 'How to Stay Productive While Working Remote', 'The Power of Continuous Learning'"
    
    def health_tool(self, query: str) -> str:
        """Provide health tips and wellness advice"""
        health_tips = {
            "exercise": "Aim for 150 minutes of moderate aerobic activity weekly. Include strength training twice a week.",
            "nutrition": "Follow the 80/20 rule: eat nutritious foods 80% of the time, allow treats 20% of the time.",
            "sleep": "Maintain 7-9 hours of sleep nightly. Create a consistent bedtime routine and avoid screens 1 hour before bed.",
            "stress": "Practice deep breathing exercises, meditation, or yoga. Take regular breaks throughout your day.",
            "hydration": "Drink 8-10 glasses of water daily. Start your morning with a glass of water to kickstart hydration."
        }
        
        query_lower = query.lower()
        for category, tip in health_tips.items():
            if category in query_lower:
                return f"Health tip for {category}: {tip}"
        
        return "General health tip: Take a 10-minute walk after meals to aid digestion and boost energy levels."
    
    def hydroponics_tool(self, query: str) -> str:
        """Provide hydroponic gardening guidance"""
        hydroponic_data = {
            "nutrients": "Use a balanced NPK solution (20-20-20) for most plants. Monitor EC levels between 1.2-2.0.",
            "ph": "Maintain pH between 5.5-6.5 for optimal nutrient uptake. Check and adjust daily.",
            "lighting": "Provide 14-16 hours of LED light daily for leafy greens, 12 hours for fruiting plants.",
            "water": "Change nutrient solution every 2-3 weeks. Maintain water temperature between 65-75°F.",
            "beginner": "Start with lettuce, spinach, or herbs. These are forgiving and grow quickly in hydroponic systems."
        }
        
        query_lower = query.lower()
        for category, advice in hydroponic_data.items():
            if category in query_lower:
                return f"Hydroponics advice for {category}: {advice}"
        
        return "General hydroponics tip: Ensure proper air circulation to prevent mold and promote healthy plant growth."
    
    def tips_tool(self, query: str) -> str:
        """Provide quick tips on various topics"""
        tips_database = {
            "productivity": "Use the Pomodoro Technique: 25 minutes focused work, 5-minute break. Repeat 4 times, then take a longer break.",
            "coding": "Follow the DRY principle (Don't Repeat Yourself) and write clean, readable code with meaningful variable names.",
            "learning": "Use active recall and spaced repetition. Teach concepts to others to solidify your understanding.",
            "communication": "Listen actively, ask clarifying questions, and summarize key points to ensure understanding.",
            "finance": "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings and debt repayment."
        }
        
        query_lower = query.lower()
        for category, tip in tips_database.items():
            if category in query_lower:
                return f"Quick tip for {category}: {tip}"
        
        return "General tip: Break large tasks into smaller, manageable chunks to reduce overwhelm and increase progress."
    
    def fun_fact_tool(self, query: str) -> str:
        """Share interesting fun facts"""
        fun_facts = [
            "Octopuses have three hearts and blue blood!",
            "A group of flamingos is called a 'flamboyance'.",
            "Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs.",
            "Bananas are berries, but strawberries aren't!",
            "A single cloud can weigh more than a million pounds.",
            "Sharks have been around longer than trees.",
            "The human brain uses about 20% of the body's total energy.",
            "There are more possible games of chess than atoms in the observable universe.",
            "Wombat poop is cube-shaped!",
            "A day on Venus is longer than its year."
        ]
        
        return f"Fun fact: {random.choice(fun_facts)}"
    
    def execute_tool(self, tool_name: str, query: str) -> Tuple[str, List[str]]:
        """Execute the selected tool and return response with sources"""
        sources = []
        
        if tool_name == "blog_tool":
            response = self.blog_tool(query)
            sources = ["Blog Tool"]
        elif tool_name == "health_tool":
            response = self.health_tool(query)
            sources = ["Health Tool"]
        elif tool_name == "hydroponics_tool":
            response = self.hydroponics_tool(query)
            sources = ["Hydroponics Tool"]
        elif tool_name == "tips_tool":
            response = self.tips_tool(query)
            sources = ["Tips Tool"]
        elif tool_name == "fun_fact_tool":
            response = self.fun_fact_tool(query)
            sources = ["Fun Fact Tool"]
        else:
            response = "I don't have specific information about that topic."
            sources = ["General Knowledge"]
        
        return response, sources
