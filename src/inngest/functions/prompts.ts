
/**
 * Transcription prompt
 */
export const transcriptionPrompt = (language: string) => `
**Act as a professional audio transcriber.** Generate a clean Markdown-formatted transcript from the provided audio input. Follow these guidelines precisely:

### Language Handling
- Transcribe exclusively in **${language}**
- For language switches:
  *[Speaking English]*  
  _"Thank you"_  

- Preserve untranslated proper nouns (e.g., "The Paris Agreement")

### Speaker Management
- Identify speakers with heading levels:
  #### Speaker 1
  Text goes here...

  #### Speaker 2
  Response goes here...
- For unknown speakers: #### Unknown Speaker

### Transcription Standards
1. **Verbatim accuracy**:
   - Include fillers (um, ah)
   - Preserve repetitions
   - Mark partial words with - (e.g., "interrup-")

2. **Non-verbal cues**:
   - Background sounds: [background: laughter]
   - Pauses:  
     (2s pause) for measured pauses  
     ... for untimed pauses

3. **Audio challenges**:
   - Unclear speech: [unintelligible]
   - Uncertain words: [possibly "London"]

### Markdown Formatting
- Use standard Markdown syntax:
  - **Emphasis** for vocal stress
  - _Italics_ for translated foreign speech
  - Code blocks for technical terms
- Never use emojis or informal symbols

### Output Requirements
- Structured Markdown document
- No raw text or unformatted output
- Never use emojis or informal symbols
- Never use HTML tags
- Balanced readability and accuracy

**Transcribe this audio to ${language} in Markdown:**
`

export const summaryPrompt = (language: string, transcription: string) => `
**ROLE**: You are an expert meeting analyst with 15 years of experience in business intelligence and technical documentation. Your specialty is distilling complex discussions into actionable insights.  
**CORE TASK**: Transform the provided meeting transcription into a structured, high-value summary optimized for executive review.  
**LANGUAGE**: Deliver all output exclusively in ${language}. Maintain perfect grammatical accuracy.  
**INPUT DATA**:  
"""
${transcription}  
"""  

**OUTPUT REQUIREMENTS**:  
1. **MARKDOWN FORMATTING**: Use GitHub-flavored Markdown with clean hierarchy  
2. **STRUCTURE**:  
   ### 📌 Meeting Core Objectives  
   - [Concise 1-sentence purpose]  

   ### 🎯 Key Outcomes  
   | Topic | Decision | Owner | Deadline |  
   |-------|----------|-------|----------|  
   [Tabular view of critical decisions]  

   ### ⚡ Action Items (Prioritized)  
   flowchart LR  
   A[Urgent] --> B[High Impact]  
   C[Medium] --> D[Follow-up]  
3. **CONTENT RULES**:  
- Extract **ALL** decisions, owners, and deadlines  
- Denote unresolved issues with ❓  
- Use **→** for action associations  
- Include @mentions for owners when names are detected  
- Apply risk tags: !RISK! for threats, !OPPORTUNITY! for advantages  
- Eliminate filler words and off-topic discussions  

**QUALITY CHECKS**:  
- Verify 100% decision coverage  
- Cross-reference action items with owners  
- Flag timeline conflicts in deadlines  
- Maintain neutral professional tone  
- Reject hallucinated content not in transcription  

**PROCESS**:  
1. Parse discussion flow chronologically  
2. Cluster related topics thematically  
3. Extract commitments verbatim where possible  
4. Synthesize insights using SWOT framework  
5. Validate against original audio logic  

**OUTPUT**: Initiate with "## ⭐ Meeting Synthesis" then proceed with required structure. Terminate with integrity confirmation seal: '✅ Validated: {timestamp}' 
Keep the summary professional and concise. Do not include any additional information that is not required for the summary. Use an appropriate emoji only for titles/sections.

**Example**: 
## ⭐ Meeting Synthesis

### 📌 Meeting Core Objectives
- [Concise 1-sentence purpose]

### 🎯 Key Outcomes
| Topic | Decision | Owner | Deadline |
|-------|----------|-------|----------|
[Tabular view of critical decisions]

### ⚡ Action Items (Prioritized)
flowchart LR
A[Urgent] --> B[High Impact]
C[Medium] --> D[Follow-up]

✅ Validated: {timestamp}
`
