import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Megaphone,
  Bell,
  ChevronDown,
  ArrowRight,
  Plus,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserMinus,
  UserCheck,
  CheckCircle2,
  Send,
  Trash2,
  Star,
} from "lucide-react";
import { Profile, Toolbar, Modal } from "../components/Shared";
export default function Assignments({
  role,
  assignments,
  setAssignments,
  people,
}) {
  let [create, setCreate] = useState(false),
    [submit, setSubmit] = useState(null),
    [review, setReview] = useState(null);
  function publish(e) {
    e.preventDefault();
    let f = new FormData(e.currentTarget);
    setAssignments([
      ...assignments,
      {
        id: Date.now(),
        title: f.get("title"),
        deadline: f.get("deadline"),
        max: +f.get("max"),
        submissions: [],
      },
    ]);
    setCreate(false);
  }
  function send(e) {
    e.preventDefault();
    let f = new FormData(e.currentTarget);
    setAssignments(
      assignments.map((a) =>
        a.id === submit
          ? {
              ...a,
              submissions: [
                ...a.submissions,
                {
                  studentId: 1,
                  repo: f.get("repo"),
                  note: f.get("note"),
                  grade: null,
                  feedback: "",
                },
              ],
            }
          : a,
      ),
    );
    setSubmit(null);
  }
  function grade(e) {
    e.preventDefault();
    let f = new FormData(e.currentTarget);
    setAssignments(
      assignments.map((a) =>
        a.id === review.a
          ? {
              ...a,
              submissions: a.submissions.map((s) =>
                s.studentId === review.s
                  ? {
                      ...s,
                      grade: +f.get("grade"),
                      feedback: f.get("feedback"),
                    }
                  : s,
              ),
            }
          : a,
      ),
    );
    setReview(null);
  }
  return (
    <section className="panel work-panel">
      <Toolbar
        title={role === "student" ? "My assignments" : "Assignments"}
        action={role === "student" ? null : "Create assignment"}
        onAction={() => setCreate(true)}
      />
      {assignments.map((a) => {
        let mine = a.submissions.find((s) => s.studentId === 1),
          pending = a.submissions.find((s) => s.grade == null);
        return (
          <article className="assignment" key={a.id}>
            <div className="assign-icon">
              <FileText />
            </div>
            <div>
              <b>{a.title}</b>
              <p>
                Due {a.deadline} · {a.max} points
              </p>
              {mine?.grade != null && (
                <small className="feedback">
                  Grade {mine.grade}/{a.max} · {mine.feedback}
                </small>
              )}
            </div>
            <span
              className={"status " + (mine?.grade != null ? "green" : "amber")}
            >
              {role === "student"
                ? mine
                  ? mine.grade != null
                    ? "Graded"
                    : "Submitted"
                  : "Not submitted"
                : pending
                  ? "Needs review"
                  : "Reviewed"}
            </span>
            {role === "student" && !mine && (
              <button className="outline" onClick={() => setSubmit(a.id)}>
                Submit work
              </button>
            )}
            {role !== "student" && pending && (
              <button
                className="outline"
                onClick={() => setReview({ a: a.id, s: pending.studentId })}
              >
                Review & grade
              </button>
            )}
          </article>
        );
      })}
      {create && (
        <Modal title="Create assignment" close={() => setCreate(false)}>
          <form className="stack-form" onSubmit={publish}>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Deadline
              <input name="deadline" type="date" required />
            </label>
            <label>
              Maximum score
              <input name="max" type="number" defaultValue="100" required />
            </label>
            <button className="primary">Publish assignment</button>
          </form>
        </Modal>
      )}
      {submit && (
        <Modal title="Submit your work" close={() => setSubmit(null)}>
          <form className="stack-form" onSubmit={send}>
            <label>
              GitHub repository URL
              <input
                name="repo"
                type="url"
                required
                placeholder="https://github.com/..."
              />
            </label>
            <label>
              Submission notes
              <textarea name="note" />
            </label>
            <button className="primary">
              <Send size={16} />
              Submit assignment
            </button>
          </form>
        </Modal>
      )}
      {review && (
        <Modal title="Review submission" close={() => setReview(null)}>
          <form className="stack-form" onSubmit={grade}>
            <p className="muted-copy">
              Student: {people.find((p) => p.id === review.s)?.name}
            </p>
            <label>
              Score
              <input name="grade" type="number" min="0" max="100" required />
            </label>
            <label>
              Feedback
              <textarea name="feedback" required />
            </label>
            <button className="primary">
              <Star size={16} />
              Publish grade & feedback
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
