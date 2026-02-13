import { useContext } from "react";
import { XPContext } from "../contexts/XPContext";

export const useXP = () => {
	const context = useContext(XPContext);
	if (!context) {
		throw new Error("useXP must be used within XPProvider");
	}
	return context;
};