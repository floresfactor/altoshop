export const columnStringSort = (arr, sortDirection, sortColumn) => {
    const comparer = (a, b) => {
        if (sortDirection === 'ASC') {
            return (a[sortColumn].toUpperCase() > b[sortColumn].toUpperCase()) ? 1 : -1;
        } else if (sortDirection === 'DESC') {
            return (a[sortColumn].toUpperCase() < b[sortColumn].toUpperCase()) ? 1 : -1;
        }
    };

    return arr.sort(comparer);
};

export const autoSize = (gridRef) => {
    const wait = (lastTime) => {
        if (gridRef) {
                gridRef.updateMetrics();
                // Repeat once again, just in case..
                if(!lastTime)
                    setTimeout(() => { wait(true); }, 500);
        } else {
            setTimeout(() => { wait(); }, 200);
        }
    };

    setTimeout(wait, 200);
};