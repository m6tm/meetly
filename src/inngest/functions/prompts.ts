
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