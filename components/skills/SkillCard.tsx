import React, { useState } from "react";
import { mutate } from "swr";
import ErrorMessage from "../ErrorMessage";
import SuccessMessage from "../SuccessMessage";
import { Skill } from "@/lib/types/skill";
import LoadingSpinner from "../LoadingSpinner";
import ArrowButton from "./arrow-up-circle.svg";

enum STATE {
  INITIAL,
  LOADING,
  ERROR,
  SUCCESS,
}

interface Props {
  skill: Skill;
  user: {
    email?: string;
    name?: string;
  };
  isDark: boolean;
}
function getIconColor(hover, isDark) {
  if (isDark) {
    return hover ? "#D1D5DB" : "#34D399";
  } else {
    return hover ? "#374151" : "#047857";
  }
}

export default function SkillCard({ skill, user, isDark }: Props) {
  const [state, setState] = useState<STATE>(STATE.INITIAL);
  const [hover, setHover] = useState<boolean>(false);
  async function onEndorse(skillId: string) {
    setState(STATE.LOADING);
    const res = await fetch("/api/endorsement", {
      body: JSON.stringify({
        skillId,
        endorseBy: user?.name || "Test user",
        email: user?.email || "not@provided.com",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const { error } = await res.json();
    if (error) {
      setState(STATE.ERROR);
      return;
    }
    mutate("/api/skill");
    setState(STATE.SUCCESS);
  }

  return (
    <div className="mb-2" key={skill.id}>
      <button
        className="flex items-center gap-1 text-lg font-semibold hover:text-gray-700 dark:hover:text-gray-300 text-green-700 dark:text-green-300 disabled:hover:cursor-not-allowed"
        onClick={() => onEndorse(skill.id)}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={!Boolean(user) || state === STATE.SUCCESS}
      >
        {state === STATE.LOADING ? (
          <LoadingSpinner />
        ) : (
          <ArrowButton
            // tailwind green
            stroke={getIconColor(hover, isDark)}
            className="inline"
          />
        )}
        <span>{skill.name}</span>
      </button>
      {skill.people.length > 0 && (
        <span>
          <strong>{skill.people.length}</strong>{" "}
          {`Endorsement${skill.people.length > 1 ? "s" : ""}`} from{" "}
          <span>{skill.people.join(", ")}</span>
        </span>
      )}
      {state === STATE.ERROR && <ErrorMessage>An unexpected error occurred.</ErrorMessage>}
      {state === STATE.SUCCESS && (
        <SuccessMessage>{`Thank you for your endorsement on ${skill.name}!`}</SuccessMessage>
      )}
    </div>
  );
}
