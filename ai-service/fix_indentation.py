#!/usr/bin/env python3

def fix_indentation():
    # Read the file
    with open('services/groq_question_generator.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the problematic method and fix indentation
    in_fallback_method = False
    fixed_lines = []
    
    for i, line in enumerate(lines):
        if 'def _get_fallback_aptitude_questions(' in line:
            in_fallback_method = True
            fixed_lines.append(line)  # Keep the method definition as is
        elif in_fallback_method and line.strip() == '':
            fixed_lines.append(line)  # Keep empty lines
        elif in_fallback_method and line.startswith('    '):
            fixed_lines.append(line)  # Already properly indented
        elif in_fallback_method and not line.startswith('    ') and line.strip():
            # This line needs to be indented
            fixed_lines.append('        ' + line)
        else:
            fixed_lines.append(line)
    
    # Write the fixed content
    with open('services/groq_question_generator.py', 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print("✅ Fixed indentation errors!")

if __name__ == "__main__":
    fix_indentation()
