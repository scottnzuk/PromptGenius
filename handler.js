const LRU = require('lru-cache');
const fs = require('fs');
const path = require('path');

// Load processed prompts
const promptsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'prompts.json'), 'utf8'));

class PromptGenius {
  constructor() {
    // LRU cache for performance optimization
    this.promptCache = new LRU({ 
      max: 500, 
      ttl: 1000 * 60 * 60 // 1 hour cache
    });

    // Indexed prompts for quick search
    this.promptIndex = this.buildPromptIndex(promptsData.prompts);
  }

  // Build searchable index of prompts
  buildPromptIndex(prompts) {
    const index = {
      byCategory: {},
      byTag: {},
      byName: {}
    };

    prompts.forEach(prompt => {
      // Index by category
      if (!index.byCategory[prompt.category]) {
        index.byCategory[prompt.category] = [];
      }
      index.byCategory[prompt.category].push(prompt);

      // Index by tags
      prompt.metadata.tags.forEach(tag => {
        if (!index.byTag[tag]) {
          index.byTag[tag] = [];
        }
        index.byTag[tag].push(prompt);
      });

      // Index by name
      index.byName[prompt.id] = prompt;
    });

    return index;
  }

  // Context-aware prompt retrieval
  getContextualPrompts(context = {}) {
    const { category, tags, complexity } = context;
    let results = promptsData.prompts;

    if (category) {
      results = results.filter(p => p.category === category);
    }

    if (tags && tags.length) {
      results = results.filter(p => 
        tags.some(tag => p.metadata.tags.includes(tag))
      );
    }

    if (complexity) {
      results = results.filter(p => p.metadata.complexity === complexity);
    }

    return results;
  }

  // Dynamic prompt generation with placeholder replacement
  generatePrompt(promptId, input = '', additionalContext = {}) {
    const prompt = this.promptIndex.byName[promptId];
    if (!prompt) {
      throw new Error(`Prompt ${promptId} not found`);
    }

    // Replace input placeholder
    let processedPrompt = prompt.prompt.replace('{input}', input);

    // Add additional context if provided
    if (additionalContext.context) {
      processedPrompt += `\n\nAdditional Context: ${additionalContext.context}`;
    }

    return {
      id: prompt.id,
      name: prompt.name,
      category: prompt.category,
      processedPrompt
    };
  }

  // Search prompts
  searchPrompts(query) {
    const lowercaseQuery = query.toLowerCase();
    return promptsData.prompts.filter(prompt => 
      prompt.name.toLowerCase().includes(lowercaseQuery) ||
      prompt.metadata.tags.some(tag => tag.includes(lowercaseQuery))
    );
  }
}

module.exports = {
  runtime: {
    handler: function({ 
      action, 
      prompt_id, 
      user_input, 
      context 
    }) {
      const promptGenius = new PromptGenius();

      switch(action) {
        case 'generate':
          return promptGenius.generatePrompt(prompt_id, user_input, context);
        
        case 'search':
          return promptGenius.searchPrompts(user_input);
        
        case 'contextual':
          return promptGenius.getContextualPrompts(context);
        
        default:
          throw new Error('Invalid action');
      }
    }
  }
};
