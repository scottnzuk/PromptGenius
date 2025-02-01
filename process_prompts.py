import pandas as pd
import json
import re

# Read the CSV file
df = pd.read_csv('prompts.csv')

# Create categories
categories = {
    "Professional Development": [
        "Developer", "Designer", "Manager", "Recruiter", 
        "Career", "Business", "Consultant", "Advisor"
    ],
    "Creative Arts": [
        "Writer", "Artist", "Musician", "Storyteller", 
        "Poet", "Composer", "Screenwriter", "Novelist"
    ],
    "Technical Skills": [
        "Coding", "Debug", "Translation", "IT", 
        "Programming", "Tech", "Software", "Engineering"
    ],
    "Personal Growth": [
        "Coach", "Counselor", "Mentor", "Life Coach", 
        "Motivational", "Psychology", "Philosophy"
    ],
    "Entertainment & Simulation": [
        "Game", "Roleplay", "Simulation", "Comedy", 
        "Storytelling", "Character", "Improv"
    ],
    "Academic & Research": [
        "Teacher", "Instructor", "Researcher", 
        "Academician", "Scholar", "Tutor"
    ]
}

def categorize_prompt(prompt_name):
    for category, keywords in categories.items():
        if any(keyword.lower() in prompt_name.lower() for keyword in keywords):
            return category
    return "Miscellaneous"

def generate_unique_id(prompt_name):
    # Create a URL-friendly unique identifier
    return re.sub(r'[^a-z0-9]+', '-', prompt_name.lower()).strip('-')

# Process prompts
processed_prompts = []
for _, row in df.iterrows():
    prompt_name = row['act']
    prompt_text = row['prompt']
    
    processed_prompt = {
        "id": generate_unique_id(prompt_name),
        "name": prompt_name,
        "category": categorize_prompt(prompt_name),
        "prompt": prompt_text,
        "placeholders": [
            {"key": "input", "description": "Main content to be inserted"}
        ],
        "metadata": {
            "complexity": "intermediate",
            "tags": prompt_name.lower().split()
        }
    }
    processed_prompts.append(processed_prompt)

# Write processed prompts to JSON
with open('prompts.json', 'w', encoding='utf-8') as f:
    json.dump({
        "version": "1.0.0",
        "total_prompts": len(processed_prompts),
        "prompts": processed_prompts
    }, f, indent=2, ensure_ascii=False)

print(f"Processed {len(processed_prompts)} prompts successfully.")
