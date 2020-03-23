const PASSWORD_LENGTH = require('../../config').passwordLength;

function randInt(s, e) {
    return Math.floor(Math.random()*(e - s) + s);
}


function shuffle(arr) {
    let top = arr.length - 1;
    let current;
    let temp;
    while (top > 0) {
        current = Math.floor(Math.random()*(top + 1));
        if (arr[current] !== top) {
            temp = arr[current];
            arr[current] = arr[top];
            arr[top] = temp;
            top -= 1;
        }
    }
}

function validatePassword(pwd) {
    let pwd_buf;
    if (typeof pwd == 'string') {
        pwd_buf = Buffer.from(pwd, 'base64');
    } else if (Buffer.isBuffer(pwd)) {
        pwd_buf = pwd;
    }

    if (pwd_buf.length != PASSWORD_LENGTH
        && (new Set(pwd_buf).size !== PASSWORD_LENGTH))
        return false;
    return true;
}

function createPassword() {
    let tempArray = new Array(PASSWORD_LENGTH);
    for (let i = 0; i < PASSWORD_LENGTH; ++i) {
        tempArray[i] = i;
    }

    do {
        shuffle(tempArray);
    } while(tempArray[0] === 0);

    // console.log(validate(tempArray))
    let passwordArray = Buffer.from(tempArray);
    return passwordArray.toString('base64');
}

function validate(arr) {
    for(let i = 0; i < arr.length; ++i) {
        if (arr[i] === i) return false;
    }
    return true;
}

// createPassword();
exports.validatePassword = validatePassword;
exports.createPassword = createPassword;