import time
import subprocess
from playwright.sync_api import sync_playwright

# Start the local server
server_process = subprocess.Popen(["python", "-m", "http.server", "4173", "--bind", "127.0.0.1"])
time.sleep(2)  # Wait for server to start

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://127.0.0.1:4173")
        time.sleep(1) # wait for app to load

        print("Adding a test commitment...")
        # Open commitment drawer
        page.locator("summary", has_text="Add a real commitment").click()

        # Fill the form
        page.locator("input[name='title']").fill("Test Delete Me")
        page.locator("input[name='detail']").fill("This is a test commitment to delete")

        # Submit the form
        page.locator("button[type='submit']", has_text="Add commitment").click()
        time.sleep(1) # wait for render

        print("Verifying commitment was added...")
        task_locator = page.locator(".task-row", has_text="Test Delete Me")
        assert task_locator.is_visible(), "Test commitment not found"

        print("Setting up dialog handler...")
        dialog_state = {"handled": False}
        def handle_dialog(dialog):
            print(f"Dialog appeared: {dialog.message}")
            assert dialog.message == "Are you sure you want to delete this record?"
            dialog.accept()
            dialog_state["handled"] = True

        page.on("dialog", handle_dialog)

        print("Clicking delete button...")
        # Find the specific delete button for our test commitment
        delete_button = task_locator.locator("[data-remove='commitments']")
        delete_button.click()

        time.sleep(1) # wait for render and deletion

        print("Verifying dialog was handled and commitment was deleted...")
        assert dialog_state["handled"], "Dialog was not handled"
        assert not task_locator.is_visible(), "Test commitment was not deleted"

        print("Success! Deletion with confirmation works as expected.")

        browser.close()
finally:
    # Stop the local server
    server_process.terminate()
