import { useState } from 'react';

const POPULAR_SKILLS = [
  'Java', 'Spring Boot', 'Python', 'SQL', 'React', 
  'JavaScript', 'TypeScript', 'HTML/CSS', 'Data Structures', 
  'AWS', 'Docker', 'Git', 'REST APIs', 'Node.js', 'C++'
];

export default function SkillsTagInput({ selectedSkills = [], onChange, disabled = false }) {
  const [inputValue, setInputValue] = useState('');

  const addSkill = (skillToAdd) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;

    const exists = selectedSkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (!exists) {
      onChange([...selectedSkills, trimmed]);
    }
    setInputValue('');
  };

  const removeSkill = (indexToRemove) => {
    onChange(selectedSkills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="skills-tag-input-container">
      {/* Selected Tags Display */}
      <div className="skills-tag-list">
        {selectedSkills.map((skill, index) => (
          <span key={index} className="skill-chip">
            <span className="skill-chip-text">{skill}</span>
            {!disabled && (
              <button
                type="button"
                className="skill-chip-remove"
                onClick={() => removeSkill(index)}
                aria-label={`Remove ${skill}`}
                title={`Remove ${skill}`}
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input row for custom skill entry */}
      {!disabled && (
        <div className="skills-input-row" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            type="text"
            id="skills-type-input"
            placeholder="Type a skill and press Enter (e.g. Docker, GraphQL)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, padding: '8px 12px', fontSize: '13.5px' }}
          />
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => addSkill(inputValue)}
          >
            + Add Skill
          </button>
        </div>
      )}

      {/* Quick suggestions */}
      {!disabled && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Popular Technical Skills (click to add):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {POPULAR_SKILLS.map((suggested) => {
              const isSelected = selectedSkills.some(
                (s) => s.toLowerCase() === suggested.toLowerCase()
              );
              return (
                <button
                  type="button"
                  key={suggested}
                  className={`skill-suggest-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (isSelected) {
                      const idx = selectedSkills.findIndex(
                        (s) => s.toLowerCase() === suggested.toLowerCase()
                      );
                      removeSkill(idx);
                    } else {
                      addSkill(suggested);
                    }
                  }}
                >
                  {isSelected ? `✓ ${suggested}` : `+ ${suggested}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
