import { useContext } from "react";
import { XPContext } from "../contexts/XPContext";

// Small wrapper hook keeps XP consumption consistent across components.
export const useXP = () => {
	const context = useContext(XPContext);
	if (!context) {
		// Failing fast here is easier to debug than silent undefined reads.
		throw new Error("useXP must be used within XPProvider");
	}
	return context;
};