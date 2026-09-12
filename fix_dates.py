import re

def fix_dates():
    with open('src/routes/(app)/track-record/+page.svelte', 'r') as f:
        content = f.read()

    # Add formatRelativeDate function
    helper = """
	function formatRelativeDate(dateString) {
		const d = new Date(dateString);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		if (d.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (d.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		} else {
			return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	}
</script>"""

    content = content.replace("</script>", helper)

    # Replace the old date rendering
    old_date = "{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(r.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}"
    new_date = "{formatRelativeDate(r.createdAt)}, {new Date(r.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}"
    
    content = content.replace(old_date, new_date)

    with open('src/routes/(app)/track-record/+page.svelte', 'w') as f:
        f.write(content)

fix_dates()
