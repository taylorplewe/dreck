let commandHistory = [];
let commandHistoryInd = -1;
const MAX_HIST_SIZE = 64;

const trim = () => {
	commandHistory = commandHistory[0..MAX_HIST_SIZE];
}
export const addToCommandHistory = command => {
	commandHistory.unshift(command) > MAX_HIST_SIZE && trim();
}
export const getPrevCommand = () => {
																																						commandHistoryInd = Math.min(commandHistoryInd + 1, commandHistory.length - 1);
	return commandHistory[commandHistoryInd] || '';
}
export const getNextCommand = () => {
	commandHistoryInd = Math.max(commandHistoryInd - 1, 0);
	return commandHistory[commandHistoryInd] || '';
}
export const resetCommandHistoryInd = () => {
	commandHistoryInd = -1;
}