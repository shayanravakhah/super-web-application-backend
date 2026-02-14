import db from "../config/DB.js";
import Movie from "../models/MovieModel.js";
import Reservation from "../models/ReservationModel.js";
import Showtime from "../models/ShowtimeModel.js";


export const getReserveByUserID = async (req, res) => {
    try {
        const selectQuery = `
            SELECT r.* ,
            s.date AS date ,s.start_time AS start_time , s.end_time AS end_time , s.price AS price,
            m.title AS title , m.description AS description ,m.genre AS genre , m.release_year AS release_year ,
            m.rating AS rating ,m.rating_count AS rating_count , m.image_url AS image_url
            FROM reservations AS r INNER JOIN showtimes AS s ON r.showtime_id = s.id INNER JOIN movies AS m ON m.id = s.movie_id 
            WHERE r.user_id = ${req.params.id}
            ORDER BY r.booking_time DESC
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getSingleReserve = async (req, res) => {
    try {
        const selectQuery = `
            SELECT *
            FROM reservations
            WHERE id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (response.length === 0) return res.status(404).json({ msg: "The reservation not found ." });
        res.status(200).json(response[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const saveReserve = async (req, res) => {
    try {
        if (!req.body.user_id) return res.status(400).json({ msg: "User ID is required." });
        if (!req.body.showtime_id) return res.status(400).json({ msg: "Showtime ID is required." });
        if (!req.body.seat_number) return res.status(400).json({ msg: "Seat number is required." });
        if (!Number.isInteger(req.body.seat_number) || req.body.seat_number <= 0) res.status(400).json({ msg: "Seat number is Invalid ." });
        const { user_id, showtime_id, seat_number } = req.body;
        const selectUserQuery = `
            SELECT * 
            FROM users
            WHERE id = ${user_id}
        `;
        const [user] = await db.query(selectUserQuery);
        if (user.length === 0) return res.status(404).json({ msg: "The user not found ." });
        const conn = await db.getConnection();
        await conn.beginTransaction();
        const selectShowtimeQuery = `
            SELECT * 
            FROM showtimes
            WHERE id = ${showtime_id}
            FOR UPDATE
        `;
        const [showtime] = await conn.query(selectShowtimeQuery);
        if (showtime.length === 0) {
            await conn.rollback();
            return res.status(404).json({ msg: "The showtime not found ." });
        }
        if (showtime[0].available_seats === 0) {
            await conn.rollback();
            return res.status(409).json({ msg: "No available seats for this showtime." });
        }
        const selectReserveQuery = `
            SELECT * 
            FROM reservations
            WHERE showtime_id = ${showtime_id} AND seat_number = ${seat_number}
        `;
        const [reservation] = await conn.query(selectReserveQuery);
        if (reservation.length > 0) {
            await conn.rollback();
            return res.status(409).json({ msg: "This seat is already booked." });
        }
        const insertQuery = `
            INSERT INTO reservations (user_id, showtime_id, seat_number)
            VALUES (${user_id}, ${showtime_id}, ${seat_number} )
        `;
        await conn.query(insertQuery);

        const updateQuery = `
            UPDATE showtimes
                SET available_seats = ${showtime[0].available_seats - 1}
            WHERE id = ${showtime_id}
        `;
        await conn.query(updateQuery);
        await conn.commit();
        res.status(201).json({ msg: "Reservation was successful." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

export const updateVote = async (req, res) => {

    try {

        const vote = req.body.vote;
        if (vote > 5 || vote < 0) return res.json({ msg: "Your vote must be between 0 and 5." })


        const reserve = await Reservation.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!reserve) return res.json({ msg: "The reserve was not found." });

        const movieID = await Showtime.findOne(
            {
                attributes: ['movie_id'],
                where: {
                    id: reserve.showtime_id
                }
            }
        )

        const movie = await Movie.findOne(
            {
                where: {
                    id: movieID.movie_id
                }
            }
        )
        let number = Number(movie.ratingCount);
        const preRating = Number(movie.rating);
        let avg = 0
        if (reserve.rate == null) {
            avg = ((vote * 1) + (preRating * number)) / (number + 1)
            number = number + 1

        } else {
            avg = ((preRating * number) + (vote - reserve.rate)) / number
        }


        await Reservation.update({ rate: req.body.vote }, {
            where: {
                id: req.params.id
            }
        });

        await Movie.update({
            rating: avg.toFixed(3),
            ratingCount: number
        }, {
            where: {
                id: movieID.movie_id
            }
        });

        res.json({ msg: "Your vote has been recorded successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}


export const deleteReserve = async (req, res) => {

    const response = await Reservation.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!response) return res.json({ msg: "The reserve was not found." });

    try {
        await Reservation.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The reserve was delete successfully ." });
    } catch (error) {
        res.json({ msgd: error.message });;
    }
}
