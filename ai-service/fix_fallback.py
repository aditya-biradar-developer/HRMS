#!/usr/bin/env python3
import re

def fix_fallback_system():
    # Read the original file
    with open('services/groq_question_generator.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Read the fallback method from the separate file
    with open('services/aptitude_fallback.py', 'r', encoding='utf-8') as f:
        fallback_content = f.read()

    # Replace the exception handler to use fallback
    old_exception_pattern = r'''        except Exception as e:
            logger\.error\(f"❌ Error generating aptitude questions: \{str\(e\)\}"\)
            return \{
                'success': False,
                'questions': \[\{
                    'topic': 'error',
                    'question': f'ERROR: AI generation error\. \{str\(e\)\}',
                    'options': \{'A': 'ERROR', 'B': 'AI error', 'C': 'occurred', 'D': 'during generation'\},
                    'correct_answer': 'A',
                    'difficulty': 'error',
                    'time_limit': 60,
                    'error': True
                \}\],
                'total_questions': 1,
                'metadata': \{'generated_by': 'error', 'type': 'aptitude_generation_error'\}
            \}'''

    new_exception = '''        except Exception as e:
            logger.error(f"❌ Error generating aptitude questions: {str(e)}")
            logger.info("🔄 Falling back to template-based question generation...")
            return self._get_fallback_aptitude_questions(topic_configs, time_per_question, job_title)'''

    # Use simple string replacement for the specific error block
    old_block = '''        except Exception as e:
            logger.error(f"❌ Error generating aptitude questions: {str(e)}")
            return {
                'success': False,
                'questions': [{
                    'topic': 'error',
                    'question': f'ERROR: AI generation error. {str(e)}',
                    'options': {'A': 'ERROR', 'B': 'AI error', 'C': 'occurred', 'D': 'during generation'},
                    'correct_answer': 'A',
                    'difficulty': 'error',
                    'time_limit': 60,
                    'error': True
                }],
                'total_questions': 1,
                'metadata': {'generated_by': 'error', 'type': 'aptitude_generation_error'}
            }'''

    # Replace the exception handler
    if old_block in content:
        content = content.replace(old_block, new_exception)
        print("✅ Replaced exception handler with fallback call")
    else:
        print("❌ Could not find exact exception block to replace")

    # Add the fallback method at the end
    content = content.rstrip() + '\n\n    ' + fallback_content

    # Write the updated content
    with open('services/groq_question_generator.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print('✅ Successfully integrated fallback system!')

if __name__ == "__main__":
    fix_fallback_system()
