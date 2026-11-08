/// translator///  
const tokenTypes = Object.freeze({
    HEADING: '__Heading__',
    BODY: '__Body__',
    END: '__END__',
    WORD: 'SIMPLE WORD'
})

class Token {
    constructor(tokenType, value = undefined) {
        this.tokenType = tokenType;
        this.value = value
    }
}

async function tokenization(file_path) {
    let curr_idx = 0; //shows the current index in the file
    let data = "";
    const response = await fetch(file_path);
    if (!response.ok) {
        throw new Error(`Couldn't read file: ${response.status}`);
    }
    data = await response.text();
    const peek = (offset = 0) => {
        return data.at(curr_idx + offset) ?? null;
    }
    const consume = () => {
        return data.at(curr_idx++) ?? null;
    }
   
    let tokens = [];
    let word = '';//a buffer to store word or a continuous string
    while (peek() !== null) {
        if (/\s/.test(peek())) { //check white  space
            consume();
            // continue;
            word = '';
        }
        while (peek() !== null && !/\s/.test(peek())) {
            word += consume(); //consume the character
        }
        if (word === '__Heading__') {
            tokens.push(new Token(tokenTypes.HEADING));
        } else if (word === '__END__') {
            tokens.push(new Token(tokenTypes.END));
        }else if (word === '__Body__') {
            tokens.push(new Token(tokenTypes.BODY));
        } else {
            tokens.push(new Token(tokenTypes.WORD, word));
        }
    }
    return tokens;
}

function generator(tokens) {
    let blog = document.createElement("div");
    const stack = [];
    let heading = '', body = '';
    tokens.forEach((token, index) => { 
        if (token.tokenType === tokenTypes.HEADING) { //Heading started
            stack.push(token);
        } else if (token.tokenType === tokenTypes.END) {
            if (stack[stack.length - 1] == tokenTypes.HEADING) {
                let headingElement = document.createElement('h1');
                headingElement.innerText = heading;
                heading = '';
                blog.appendChild(heading);
            }else if (stack[stack.length - 1] == tokenTypes.BODY) {
                let paragraphElement = document.createElement('p');
                paragraphElement.innerText = body;
                body = '';
                blog.appendChild(paragraphElement);
            }
            stack.pop();//pop the last one
        }else if (token.tokenType === tokenTypes.BODY) { //body started
            stack.push(token);
        } else {
            if (stack[stack.length - 1] == tokenTypes.HEADING) {
                while (token[index] <= token.length && token[index] !== tokenTypes.END) {
                    heading += token[index].value ;
                    index++;
                }
            }
            else if (stack[stack.length - 1] == tokenTypes.BODY) {
                while (token[index] <= token.length && token[index] !== tokenTypes.END) {
                    body += token[index].value ;
                    index++;
                }
            }
        }
    });
}
//////////////////////////////////////////////////////
const blogTable = document.querySelector('.blogs-cards');

async function loadBlogs() {
    try {
        const response = await fetch('./blog-contents.json');
        if (!response.ok) {
            throw new Error('Unable to load blog list');
        }
        const blogs = await response.json();

        blogs.forEach(filename => {
            const anchor = document.createElement('a');

            anchor.textContent = filename.replace(/\.txt$/, '');
            anchor.href = `./detailed-blog.html?blog=${encodeURIComponent(filename)}`;

            blogTable.appendChild(anchor);
        });
    } catch (error) {
        blogTable.textContent = error.message;
    }
}

loadBlogs();