// Change 1: Added useRef to create a reference to the GraphView component
import React, { useEffect, useState, useRef } from "react";
import { CgClose } from "react-icons/cg";
// Change 17: Import navigation icons for prev/next buttons
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
// Change 2: Import GraphViewHandle type to properly type the ref
import GraphView, { type GraphViewHandle } from "./GraphView";
import { type CompiledSchema } from "@hyperjump/json-schema/experimental";
import { Tooltip } from "react-tooltip";

const SchemaVisualization = ({
  compiledSchema,
}: {
  compiledSchema: CompiledSchema | null;
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(true);
  // Change 18: Track match count and current index for navigation UI
  const [matchCount, setMatchCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Change 3: Create a ref to access GraphView's searchNode method
  const graphViewRef = useRef<GraphViewHandle>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value.trim();
    if (!searchString) {
      setErrorMessage("");
      // Change 19: Reset match count when search is cleared
      setMatchCount(0);
      return;
    }
    // Change 4: Call the actual searchNode function via ref instead of the stub
    const found = graphViewRef.current?.searchNode(searchString);
    if (!found) {
      setErrorMessage(`${searchString} is not in schema`);
      setMatchCount(0);
    } else {
      setErrorMessage("");
      // Change 20: Get match information to display navigation controls
      const matchInfo = graphViewRef.current?.getMatchInfo();
      if (matchInfo) {
        setMatchCount(matchInfo.count);
        setCurrentIndex(matchInfo.currentIndex);
      }
    }
  };

  // Change 21: Handle navigation between multiple matches
  const handleNavigate = (direction: 'next' | 'prev') => {
    graphViewRef.current?.navigateMatch(direction);
    const matchInfo = graphViewRef.current?.getMatchInfo();
    if (matchInfo) {
      setCurrentIndex(matchInfo.currentIndex);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setShowErrorPopup(true);
      const timer = setTimeout(() => {
        setShowErrorPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowErrorPopup(false);
    }
  }, [errorMessage]);

  return (
    <>
      {/* Change 5: Pass the ref to GraphView to access its searchNode method */}
      <GraphView ref={graphViewRef} compiledSchema={compiledSchema} />

      {/*Error Message */}
      {errorMessage && showErrorPopup && (
        <div className="absolute bottom-[50px] left-[100px] flex gap-2 px-2 py-1 bg-red-500 text-white rounded-md shadow-lg">
          <div className="text-sm font-medium tracking-wide font-roboto">
            {errorMessage}
          </div>
          <button
            className="cursor-pointer"
            onClick={() => setShowErrorPopup(false)}
          >
            <CgClose size={18} />
          </button>
        </div>
      )}

      <div className="absolute bottom-[10px] left-[50px] flex items-center gap-2">
        <input
          type="text"
          maxLength={30}
          placeholder="search node"
          className="outline-none text-[var(--bottom-bg-color)] border-b-2 text-center w-[150px]"
          onChange={handleChange}
        />
        
        {/* Change 22: Show navigation controls only when there are multiple matches */}
        {matchCount > 1 && (
          <div className="flex items-center gap-1 bg-[var(--node-bg-color)] px-2 py-1 rounded border border-[var(--text-color)] opacity-80">
            <button
              onClick={() => handleNavigate('prev')}
              className="hover:bg-[var(--text-color)] hover:bg-opacity-20 rounded p-1 transition-colors"
              title="Previous match"
            >
              <MdNavigateBefore size={20} className="text-[var(--text-color)]" />
            </button>
            
            {/* Change 23: Display current match position out of total matches */}
            <span className="text-xs text-[var(--text-color)] min-w-[40px] text-center">
              {currentIndex + 1}/{matchCount}
            </span>
            
            <button
              onClick={() => handleNavigate('next')}
              className="hover:bg-[var(--text-color)] hover:bg-opacity-20 rounded p-1 transition-colors"
              title="Next match"
            >
              <MdNavigateNext size={20} className="text-[var(--text-color)]" />
            </button>
          </div>
        )}
      </div>
      <div className="absolute bottom-[10px] right-[10px] z-10">
        <img
          src="trust-badge.svg"
          alt="Local-only processing"
          className="w-9 h-9"
          draggable="false"
          data-tooltip-id="local-only-tooltip"
        />
      </div>
      <Tooltip
        id="local-only-tooltip"
        content="Your data never leaves your device. All processing happens locally."
        style={{ fontSize: "10px" }}
      />
    </>
  );
};

export default SchemaVisualization;
