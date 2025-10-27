#!/usr/bin/env python3

def fix_api_error_handlers():
    # Read the file
    with open('services/groq_question_generator.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace API error handlers with fallback calls
    
    # 1. Replace rate limit error (429)
    old_rate_limit = '''                logger.error(f"❌ All {len(self.api_keys)} API keys are rate limited")
                return {
                    'success': False,
                    'questions': [{
                        'topic': 'error',
                        'question': f'ERROR: All {len(self.api_keys)} GROQ API keys are rate limited. Please wait and try again later.',
                        'options': {'A': 'ERROR', 'B': 'All keys', 'C': 'rate limited', 'D': 'Try later'},
                        'correct_answer': 'A',
                        'difficulty': 'error',
                        'time_limit': 60,
                        'error': True
                    }],
                    'total_questions': 1,
                    'metadata': {'generated_by': 'error', 'type': 'all_keys_rate_limited'}
                }'''

    new_rate_limit = '''                logger.error(f"❌ All {len(self.api_keys)} API keys are rate limited")
                logger.info("🔄 Falling back to template-based question generation...")
                return self._get_fallback_aptitude_questions(topic_configs, time_per_question, job_title)'''

    # 2. Replace API error (non-200 status)
    old_api_error = '''                logger.error(f"❌ API error: {response.status_code}")
                return {
                    'success': False,
                    'questions': [{
                        'topic': 'error',
                        'question': f'ERROR: AI API failed with status {response.status_code}',
                        'options': {'A': 'ERROR', 'B': 'API failure', 'C': f'Status {response.status_code}', 'D': 'Try again'},
                        'correct_answer': 'A',
                        'difficulty': 'error',
                        'time_limit': 60,
                        'error': True
                    }],
                    'total_questions': 1,
                    'metadata': {'generated_by': 'error', 'type': 'api_error'}
                }'''

    new_api_error = '''                logger.error(f"❌ API error: {response.status_code}")
                logger.info("🔄 Falling back to template-based question generation...")
                return self._get_fallback_aptitude_questions(topic_configs, time_per_question, job_title)'''

    # 3. Replace no API key error
    old_no_key = '''            logger.error("❌ No GROQ API key - cannot generate AI aptitude questions")
            return {
                'success': False,
                'questions': [{
                    'topic': 'error',
                    'question': 'ERROR: AI not able to generate content. Please configure GROQ API key.',
                    'options': {'A': 'ERROR', 'B': 'AI service', 'C': 'unavailable', 'D': 'configure API key'},
                    'correct_answer': 'A',
                    'difficulty': 'error',
                    'time_limit': 60,
                    'error': True
                }],
                'total_questions': 1,
                'metadata': {'generated_by': 'error', 'type': 'aptitude_error'}
            }'''

    new_no_key = '''            logger.error("❌ No GROQ API key - cannot generate AI aptitude questions")
            logger.info("🔄 Falling back to template-based question generation...")
            return self._get_fallback_aptitude_questions(topic_configs, time_per_question, job_title)'''

    # Apply replacements
    replacements_made = 0
    
    if old_rate_limit in content:
        content = content.replace(old_rate_limit, new_rate_limit)
        replacements_made += 1
        print("✅ Updated rate limit handler")
    
    if old_api_error in content:
        content = content.replace(old_api_error, new_api_error)
        replacements_made += 1
        print("✅ Updated API error handler")
    
    if old_no_key in content:
        content = content.replace(old_no_key, new_no_key)
        replacements_made += 1
        print("✅ Updated no API key handler")

    # Write the updated content
    with open('services/groq_question_generator.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'✅ Successfully updated {replacements_made} error handlers to use fallback system!')

if __name__ == "__main__":
    fix_api_error_handlers()
