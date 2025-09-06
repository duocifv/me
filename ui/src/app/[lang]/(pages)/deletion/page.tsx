import React from "react";

export default function DataDeletion() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Data Deletion Instructions</h1>
      <p>
        This application does not store any personal data on our servers. If you
        wish to remove the app’s access to your Facebook data, you can do so by
        following these steps:
      </p>
      <ol>
        <li>Log in to your Facebook account</li>
        <li>Go to Settings &gt; Apps and Websites</li>
        <li>Find this application and remove it</li>
      </ol>
      <p>Once removed, the app will no longer have access to your data.</p>
    </main>
  );
}
