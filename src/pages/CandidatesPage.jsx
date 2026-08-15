import "../styles/CandidatesPage.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineEye,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8080";

function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load candidates from backend
   */
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/candidates`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          throw new Error(
            "You are not logged in. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load candidates."
          );
        }

        const data = await response.json();

        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading candidates:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  /*
   * Search + status filtering
   */
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        candidate.name?.toLowerCase().includes(searchValue) ||
        candidate.email?.toLowerCase().includes(searchValue) ||
        candidate.position?.toLowerCase().includes(searchValue) ||
        candidate.interview?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        candidate.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, statusFilter]);

  const getInitial = (name) => {
    if (!name) return "?";

    return name.charAt(0).toUpperCase();
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <section className="module-page candidates-page">

        <div className="candidates-header">
          <div>
            <h1>Candidates</h1>

            <p>
              Review candidates and their submitted interviews.
            </p>
          </div>
        </div>

        <div className="candidate-loading">
          <p>Loading candidates...</p>
        </div>

      </section>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <section className="module-page candidates-page">

        <div className="candidates-header">
          <div>
            <h1>Candidates</h1>

            <p>
              Review candidates and their submitted interviews.
            </p>
          </div>
        </div>

        <div className="candidate-error">
          <h3>Unable to load candidates</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>

      </section>
    );
  }

  return (
    <section className="module-page candidates-page">

      {/* Header */}
      <div className="candidates-header">
        <div>
          <h1>Candidates</h1>

          <p>
            Review candidates and their submitted interviews.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="candidate-toolbar">

        <div className="candidate-search">

          <HiOutlineMagnifyingGlass />

          <input
            type="text"
            placeholder="Search by name, email or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="candidate-filter">

          <HiOutlineFunnel />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Reviewed">
              Reviewed
            </option>
          </select>

        </div>

      </div>

      {/* Results */}
      <div className="candidate-count">
        Showing {filteredCandidates.length} candidate
        {filteredCandidates.length !== 1 ? "s" : ""}
      </div>

      {/* Desktop Table */}
      <div className="candidate-table-wrapper">

        <table className="candidate-table">

          <thead>
            <tr>
              <th>Candidate</th>
              <th>Position / Interview</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredCandidates.length > 0 ? (

              filteredCandidates.map((candidate) => (

                <tr key={candidate.id}>

                  <td>

                    <div className="candidate-person">

                      <div className="candidate-avatar">
                        {getInitial(candidate.name)}
                      </div>

                      <div>
                        <strong>
                          {candidate.name}
                        </strong>

                        <span>
                          {candidate.email}
                        </span>
                      </div>

                    </div>

                  </td>

                  <td>

                    <div className="candidate-position">

                      <strong>
                        {candidate.position}
                      </strong>

                      <span>
                        {candidate.interview}
                      </span>

                    </div>

                  </td>

                  <td>

                    <span
                      className={`status-badge status-${candidate.status?.toLowerCase()}`}
                    >
                      {candidate.status}
                    </span>

                  </td>

                  <td>
                    {candidate.submittedAt || "-"}
                  </td>

                  <td>

                    <Link
                      to={`/dashboard/candidates/${candidate.id}`}
                      className="view-candidate-btn"
                    >
                      <HiOutlineEye />
                      View
                    </Link>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="5"
                  className="no-candidates"
                >
                  <h3>No candidates found</h3>

                  <p>
                    Try changing your search or status filter.
                  </p>
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* Mobile Cards */}
      <div className="candidate-mobile-list">

        {filteredCandidates.map((candidate) => (

          <div
            className="candidate-mobile-card"
            key={candidate.id}
          >

            <div className="candidate-mobile-header">

              <div className="candidate-person">

                <div className="candidate-avatar">
                  {getInitial(candidate.name)}
                </div>

                <div>

                  <strong>
                    {candidate.name}
                  </strong>

                  <span>
                    {candidate.email}
                  </span>

                </div>

              </div>

              <span
                className={`status-badge status-${candidate.status?.toLowerCase()}`}
              >
                {candidate.status}
              </span>

            </div>

            <div className="candidate-mobile-details">

              <div>
                <small>Position</small>

                <strong>
                  {candidate.position}
                </strong>
              </div>

              <div>
                <small>Interview</small>

                <strong>
                  {candidate.interview}
                </strong>
              </div>

              <div>
                <small>Submitted</small>

                <strong>
                  {candidate.submittedAt || "-"}
                </strong>
              </div>

            </div>

            <Link
              to={`/dashboard/candidates/${candidate.id}`}
              className="view-candidate-btn mobile-view-btn"
            >
              <HiOutlineEye />
              View Candidate
            </Link>

          </div>

        ))}

      </div>

    </section>
  );
}

export default CandidatesPage;