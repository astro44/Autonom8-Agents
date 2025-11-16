# OxygenChain Website - Gemini Context

## Project Mission
Chemical-free water treatment for Rio favelas. Build modern multilingual site showcasing environmental impact.

## Tech Stack
- **Frontend**: Vanilla JS/CSS/HTML (no frameworks)
- **Hosting**: S3 + CloudFront (static only)
- **i18n**: EN, PT, ES, FR with browser detection

## Key Requirements
1. **Performance**: Vanilla JS, GPU-accelerated animations
2. **Multilingual**: 4 languages, client-side switching
3. **No SSR**: Must run from static S3 hosting
4. **Animations**: Scroll effects, parallax, water flow viz

## Design System
- **Colors**: Navy background (#090B14), white accents
- **Typography**: Responsive scaling (4.267vw mobile → 2.7rem desktop)
- **Animations**: cubic-bezier(0.25,0.46,0.45,0.94), GPU-accelerated (translate3d)

## Success Metrics
- 200% increase in session duration
- 150% increase in donation inquiries
- 4+ language support
- 90+ Lighthouse score

## Key Facts
- Problem: 36 Olympic pools/day untreated sewage (Vidigal)
- Solution: Oxidation-based treatment (no chemicals)
- Target: Rio favela communities, NGO partners, donors

## Output Format
Always return valid JSON wrapped in markdown code fences:
```json
{
  "field": "value"
}
```
