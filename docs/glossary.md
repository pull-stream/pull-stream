# Glossary

## read (end, cb)

A function that retrives the next chunk.
All readable streams (sources, and throughs)
must return a `read` function.

## reader (read,...)

A function to create a reader. It takes a `read` function
as the first argument, and any other options after that.

When passed to `pipeable` or `pipeableSource`,
a new function is created that adds `.pipe(dest)`

## Lazy vs Eager

Lazy means to avoid doing something until you know you have
to do it.

Eager means to do something early, so you have it ready
immediately when you need it.
