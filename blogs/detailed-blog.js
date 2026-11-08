const tokenTypes = Object.freeze({
    HEADING: '__Heading__',
    BODY: '__Body__',
    END: '__End__',
    WORD: 'SIMPLE WORD'
})

class Token {
    constructor(tokenType, value = undefined) {
        this.tokenType = tokenType;
        this.value = value
    }
}


async function tokenization(file_path) {
    let curr_idx = 0;
    const response = await fetch(file_path);

    if (!response.ok) {
        throw new Error(`Couldn't read file: ${response.status}`);
    }

    const data = await response.text();
    const peek = (offset = 0) => data.at(curr_idx + offset) ?? null;
    const consume = () => data.at(curr_idx++) ?? null;

    const tokens = [];
    let word = '';
    let insideBlock = false;

    while (peek() !== null) {
        if (!insideBlock) {
            if (data.startsWith('__Heading__', curr_idx)) { // Recognize block starting markers.
                tokens.push(new Token(tokenTypes.HEADING));
                curr_idx += '__Heading__'.length;
                insideBlock = true;
                continue;
            }

            if (data.startsWith('__Body__', curr_idx)) {
                tokens.push(new Token(tokenTypes.BODY));
                curr_idx += '__Body__'.length;
                insideBlock = true;
                continue;
            }

            // Ignore whitespace outside blocks.
            if (/\s/.test(peek())) {
                consume();
                continue;
            }

        } else {
            if (data.startsWith('__End__', curr_idx)) { // Recognize only END inside a block.

                if (word.length > 0) {
                    tokens.push(new Token(tokenTypes.WORD, word));
                }

                tokens.push(new Token(tokenTypes.END));
                curr_idx += '__End__'.length;
                word = '';
                insideBlock = false;
                continue;
            }
        }
        // Consume ordinary content.
        if (insideBlock) {
            word += consume();
        } else {
            consume();
        }
    }
    
    if (insideBlock && word.length > 0) {
        tokens.push(new Token(tokenTypes.WORD, word));
    }
    return tokens;
}
function generator(tokens) {
    const blog = document.createElement("div");
    const stack = [];

    let heading = '';
    let body = '';

    tokens.forEach(token => {
        if (token.tokenType === tokenTypes.HEADING) {
            stack.push(token);

        } else if (token.tokenType === tokenTypes.BODY) {
            stack.push(token);

        } else if (token.tokenType === tokenTypes.END) {
            const current = stack[stack.length - 1];

            if (current.tokenType === tokenTypes.HEADING) {
                const headingElement = document.createElement('h1');
                headingElement.textContent = heading.trim();

                blog.appendChild(headingElement);
                heading = '';

            } else if (current.tokenType === tokenTypes.BODY) {
                const paragraphElement = document.createElement('p');
                paragraphElement.textContent = body.trim();

                blog.appendChild(paragraphElement);
                body = '';
            }

            stack.pop();

        } else if (token.tokenType === tokenTypes.WORD) {
            const current = stack[stack.length - 1];

            if (current.tokenType === tokenTypes.HEADING) {
                heading += token.value;

            } else if (current.tokenType === tokenTypes.BODY) {
                body += token.value;
            }
        }
    });
    const current = stack[stack.length - 1];
    
    if (current?.tokenType === tokenTypes.HEADING) {
        const headingElement = document.createElement('h1');
        headingElement.textContent = heading.trim();
        blog.appendChild(headingElement);
    
    } else if (current?.tokenType === tokenTypes.BODY) {
        const paragraphElement = document.createElement('p');
        paragraphElement.textContent = body.trim();
        blog.appendChild(paragraphElement);
    }
    return blog;
}

const blogContent = document.querySelector('.blog-content');

// async function loadBlog(filename) {
//     const tokens = await tokenization(
//         `./content/${encodeURIComponent(filename)}`
//     );
// 
//     return generator(tokens);
// }
async function loadBlog(filename) {
    const tokens = await tokenization(
        `./content/${encodeURIComponent(filename)}`
    );

    console.log('TOKENS:', tokens);

    const blog = generator(tokens);

    console.log('GENERATED HTML:', blog.innerHTML);

    return blog;
}
async function init() {
    const params = new URLSearchParams(window.location.search);
    const filename = params.get('blog');

    if (!filename || filename.includes('/') || filename.includes('\\')) {
        blogContent.textContent = 'Invalid blog filename.';
        return;
    }

    try {
        const blog = await loadBlog(filename);

        blogContent.replaceChildren(blog);

    } catch (error) {
        console.error(error);
        blogContent.textContent = error.message;
    }
}

init();