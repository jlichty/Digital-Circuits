// LEGACY (JUNK) TO BE RE-IMPLEMENTED

// export default (function() {
	
// 	var undoStack = [];
// 	var redoStack = [];
// 	var activeStack = undoStack;
// 	var isTransactionOpen = false;
	
// 	var service = {
// 		undo: function() {
// 			if (undoStack.length < 1) {
// 				return;
// 			}
// 			var popped;
// 			activeStack = redoStack;
// 			service.beginTransaction();
// 			while (undoStack.length > 0) {
// 				popped = undoStack.pop();
// 				if (popped.item === 'begin') {
// 					break;
// 				}
// 				popped.item[popped.methodString]();
// 			}
// 			service.endTransaction();
// 			activeStack = undoStack;
// 		},
// 		redo: function() {
// 			if (redoStack.length < 1) {
// 				return;
// 			}
// 			var popped;
// 			service.beginTransaction();
// 			while (redoStack.length > 0) {
// 				popped = redoStack.pop();
// 				if (popped.item === 'begin') {
// 					break;
// 				}
// 				popped.item[popped.methodString]();
// 			}
// 			service.endTransaction();
// 		},
// 		beginTransaction: function() {
// 			if (isTransactionOpen) {
// 				throw new Error('Undoservice: Your last transaction was not properly ended.');
// 			}
// 			isTransactionOpen = true;
// 			service.push('begin', null);
// 		},
// 		endTransaction: function() {
// 			if (!isTransactionOpen) {
// 				throw new Error('Undoservice: Your last transaction was not properly begun.');
// 			}
// 			isTransactionOpen = false;
// 		},
// 		push: function(o, methodString) {
// 			if (isTransactionOpen) {
// 				activeStack.push({item: o, methodString: methodString});
// 			}
// 		},
// 		flushRedoStack: function() {
// 			while (redoStack.length > 0) {
// 				var popped = redoStack.pop();
// 				if (popped.item.purge) {
// 					popped.item.purge();
// 				}
// 			}
// 		}
// 	};

// 	return service;

// }());