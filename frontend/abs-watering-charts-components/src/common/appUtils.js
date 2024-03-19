
export const groupBy = (x,f)=>x.reduce((a,b)=>((a[f(b)]||=[]).push(b), a),{});

export const average = arr => arr.reduce((acc,v) => acc + v) / arr.length;