When etherpad came out in 2008 it quickly became an indispensable tool for all
kinds of situations. Since then many have tried to recreate this magical tool
but few have succeeded.

In my opinion, most of these projects suffer from too much complexity. But this
one is different. This project concentrates on:

-	**Plain text**. No syntax highlighting, markdown preview, image upload, PDF
	export, WYSIWYG tools. Just a single textarea.
-	**Rough consensus**. No advanced operational transforms, no blockchain. In
	practice, conflicts are rare and sophisticated algorithms are not doing a
	stellar job either. The single source of truth is the order of messages
	broadcasted by the server. Conflicting changes are dropped.

So this is ~220 lines of javascript code backed by a
[via](https://github.com/xi/via) server. A demo is available at
<https://pad.ce9e.org/>.
