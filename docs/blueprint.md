# **App Name**: Cloudflare DNS Manager

## Core Features:

- Authentication: Authenticate with Cloudflare using an API token and Zone ID.
- Fetch DNS Records: Retrieve all DNS records for a specified zone via the Cloudflare API.
- Display DNS Records: Display DNS records in a sortable, searchable table with type, name, content, and TTL fields.
- Create DNS Records: Create new DNS records for the specified zone.
- Edit DNS Records: Modify existing DNS records by updating their content and/or TTL.
- Delete DNS Records: Delete existing DNS records from the zone.
- CORS Handling: Implement server-side CORS handling to ensure secure communication with the Cloudflare API.

## Style Guidelines:

- Primary color: Dark blue (#3F51B5) to convey trust and reliability.
- Background color: Light gray (#F5F5F5) to provide a clean and modern look.
- Accent color: Teal (#009688) to highlight important actions and interactive elements.
- Use a clean and readable sans-serif font for the interface.
- Use simple, outlined icons for common actions (edit, delete, add).
- Utilize a clear and structured layout with distinct sections for DNS records and management actions.
- Use subtle animations and transitions to provide feedback on user actions (e.g., record creation, update, deletion).