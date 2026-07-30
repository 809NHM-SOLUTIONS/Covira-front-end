function CandidatesPage() {
  return (
    <section className="module-page">
      <h1>Candidates</h1>
      <p>Review candidates and their submitted interviews.</p>

      <div className="module-empty-state">
        <h2>No candidates yet</h2>
        <p>Candidate submissions will appear here.</p>
      </div>
    </section>
  );
}

export default CandidatesPage;