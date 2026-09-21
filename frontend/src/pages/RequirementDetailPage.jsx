import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import FadeIn from "../components/FadeIn";
import MatchCard from "../components/MatchCard";
import MatchDetailDrawer from "../components/MatchDetailDrawer";

export default function RequirementDetailPage() {
  const { requirementId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getMatches(requirementId);
      setMatches(res.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const runMatching = async () => {
    setRunning(true);
    setError("");
    setInfo("");
    try {
      const res = await api.runMatching(requirementId);
      setMatches(res.matches || []);
      const count = res.count ?? res.matches?.length ?? 0;
      setInfo(
        `Found ${count} match(es). Client and supplier emails were queued for relevant results.`,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-panel stack-lg">
      <FadeIn>
        <div className="page-header">
          <Link to="/client" className="card__meta">← Back to requirements</Link>
          <h1 style={{ marginTop: "0.5rem" }}>Match results</h1>
          <p>Click any match to see the full AI scoring breakdown, explanations, and supplier details.</p>
        </div>
      </FadeIn>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn--accent"
          onClick={runMatching}
          disabled={running}
        >
          {running ? "Running AI pipeline…" : "Run AI matching"}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={loadMatches}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {info && <div className="alert alert--success">{info}</div>}

      {loading ? (
        <div className="loading-block">
          <span className="spinner" aria-hidden="true" />
          Loading matches…
        </div>
      ) : matches.length === 0 ? (
        <div className="card empty">
          <h3>No matches yet</h3>
          <p>Run AI matching to generate ranked supplier recommendations.</p>
        </div>
      ) : (
        <div className="match-grid">
          {matches.map((match, index) => (
            <MatchCard
              key={match.id || `${match.offering_id}-${match.supplier_id}`}
              match={match}
              style={{ animationDelay: `${index * 70}ms` }}
              onOpen={setSelectedMatch}
            />
          ))}
        </div>
      )}

      {selectedMatch && (
        <MatchDetailDrawer
          match={selectedMatch}
          requirementId={requirementId}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
