
This document describes some examples of where various features
of pull streams are used in simple real-world examples.

Much of the focus here is handling the error cases. Indeed,
distributed systems are _all about_ handling the error cases.

# simple source that ends correctly. (read, end)

A normal file (source) is read, and sent to a sink stream
that computes some aggregation upon that input.
such as the number of bytes, or number of occurances of the `\n`
character (i.e. the number of lines).

The source reads a chunk of the file at each time it's called,
there is some optimium size depending on your operating system,
file system, physical hardware,
and how many other files are being read concurrently.

when the sink gets a chunk, it iterates over the characters in it
counting the `\n` characters. when the source returns `end` to the
sink, the sink calls a user provided callback.

# source that may fail. (read, err, end)

download a file over http and write it to fail.
The network should always be considered to be unreliable,
and you must design your system to recover from failures.
So there for the download may fail (wifi cuts out or something)

The read stream is just the http download, and the sink
writes it to a tempfile. If the source ends normally,
the tempfile is moved to the correct location.
If the source errors, the tempfile is deleted.

(you could also write the file to the correct location,
and delete it if it errors, but the tempfile method has the advantage
that if the computer or process crashes it leaves only a tempfile
and not a file that appears valid. stray tempfiles can be cleaned up
or resumed when the process restarts)

# sink that may fail

If we read a file from disk, and upload it,
then it is the sink that may error.
The file system is probably faster than the upload,
so it will mostly be waiting for the sink to ask for more.
usually, the sink calls read, and the source gets more from the file
until the file ends. If the sink errors, it calls `read(true, cb)`
and the source closes the file descriptor and stops reading.
In this case the whole file is never loaded into memory.

# sink that may fail out of turn.

A http client connects to a log server and tails a log in realtime.
(another process writes to the log file,
but we don't need to think about that)

The source is the server log stream, and the sink is the client.
First the source outputs the old data, this will always be a fast
response, because that data is already at hand. When that is all
written then the output rate may drop significantly because it will
wait for new data to be added to the file. Because of this,
it becomes much more likely that the sink errors (the network connection
drops) while the source is waiting for new data. Because of this,
it's necessary to be able to abort the stream reading (after you called
read, but before it called back). If it was not possible to abort
out of turn, you'd have to wait for the next read before you can abort
but, depending on the source of the stream, that may never come.

# a through stream that needs to abort.

Say we read from a file (source), JSON parse each line (through),
and then output to another file (sink).
because there is valid and invalid JSON, the parse could error,
if this parsing is a fatal error, then we are aborting the pipeline
from the middle. Here the source is normal, but then the through fails.
When the through finds an invalid line, it should abort the source,
and then callback to the sink with an error. This way,
by the time the sink receives the error, the entire stream has been cleaned up.

(you could abort the source, and error back to the sink in parallel,
but if something happened to the source while aborting, for the user
to know they'd have to give another callback to the source, this would
get called very rarely so users would be inclined to not handle that.
better to have one callback at the sink.)

In some cases you may want the stream to continue, and just ignore
an invalid line if it does not parse. An example where you definately
want to abort if it's invalid would be an encrypted stream, which
should be broken into chunks that are encrypted separately.
