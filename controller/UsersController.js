import Users from "../models/UserModel.js"
import db from "../config/DB.js";

export const getUsers = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM users
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const singleUser = async (req, res) => {

    try {
        const selectQuery = `
            SELECT * 
            FROM users
            WHERE id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// export const getUserID = async (req, res) => {

//     if (!req.body.name || !req.body.password) return res.json({ msg: "Name and password are required ." })
//     try {
//         const response = await Users.findOne({
//             attributes: ['id'],
//             where: {
//                 name: req.body.name,
//                 password: req.body.password
//             }
//         });
//         res.json(response);
//     } catch (error) {
//         res.json({ msg: error.message })
//     }
// }

export const saveUser = async (req, res) => {
    if (!req.body) return res.status(400).json({ msg: "Please send some information about youeself ." })
    if (!req.body.user_name) return res.status(400).json({ msg: "Username is required." });
    if (!req.body.password) return res.status(400).json({ msg: "Password is required." });
    if (!req.body.birth_date) return res.status(400).json({ msg: "Birth date is required." });
    if (!req.body.nationality) return res.status(400).json({ msg: "Nationality is required." });
    if (!req.body.email) return res.status(400).json({ msg: "Email is required." });
    const user_name = req.body.user_name;
    const password = req.body.password;
    const birth_date = req.body.birth_date;
    const email = req.body.email;
    const nationality = req.body.nationality;
    const url = req.body.url ? req.body.url : null;

    try {
        const checkEmailQuery = `
            SELECT * 
            FROM users
            WHERE email = '${email}'
        `;
        const [checkEmail] = await db.query(checkEmailQuery);
        if (checkEmail.length > 0) return res.status(409).json({ msg: "An account with this email already exists." });

        const checkUsernameQuery = `
                SELECT * 
                FROM users
                WHERE username = '${user_name}'
            `;
        const [checkUsername] = await db.query(checkUsernameQuery);
        if (checkUsername.length > 0) return res.status(409).json({ msg: "This username is already taken." });

        const insertQuery = `
            INSERT INTO users (user_name, password, birth_date, email, nationality , url)
            VALUES ('${user_name}', '${password}', '${birth_date}', '${email}' , '${nationality}' , '${url}')
        `;
        await db.query(insertQuery);
        res.status(201).json({ msg: "The user was added successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

export const updateUser = async (req, res) => {

    const user = await Users.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!user) return res.json({ msg: "The user was not found." });

    let name = ""
    let password = ""
    let age = ""
    let nationality = ""
    let url = ""

    if (req.body.name == "") {
        name = user.name
    } else {
        name = req.body.name;
    }

    if (req.body.password == "") {
        password = user.password
    } else {
        password = req.body.password;
    }

    if (req.body.age == "") {
        age = user.age
    } else {
        age = req.body.age;
    }

    if (req.body.nationality == "") {
        nationality = user.nationality
    } else {
        nationality = req.body.nationality;
    }

    if (req.body.url == "") {
        url = user.url
    } else {
        url = req.body.url;
    }

    try {
        await Users.update({ name: name, age: age, nationality: nationality, url: url, password: password }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The user was update successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}

export const deleteUser = async (req, res) => {

    const response = await Users.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!response) return res.json({ msg: "The user was not found." });

    try {
        await Users.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The user was delete successfully ." });
    } catch (error) {
        res.json({ msgd: error.message });;
    }
}

