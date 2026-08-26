// app/[slug]/not-found.tsx
//
// Shown whenever a slug doesn't match any Strapi item. Customize this to
// match your Webflow site's actual 404 design so it feels consistent.

export default function NotFound() {
  return (
    <main className="send-money-not-found">
      <h1>We couldn't find that page</h1>
      <p>The page you're looking for doesn't exist or may have been moved.</p>
      <a href="/send-money">Back to Send Money</a>
    </main>
  );
}
