Test the full MCQ assessment flow.

1. Start the dev server if not running
2. Test /api/chat with curl:
   - Send a greeting message
   - Send "test my JavaScript knowledge"
   - Verify Claude calls the assessment tool
   - Verify response contains :::mcq block
3. Check that item-bank.json has valid items
4. Report any issues found

Expected flow:
User: "test my JavaScript knowledge"
Claude: [calls assessment_get_item] -> [formats :::mcq block]
UI: [parses block] -> [renders MCQCard]
User: [clicks answer]
System: [logs response] -> [sends context back to Claude]
Claude: [continues conversation with feedback]
