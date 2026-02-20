import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  },
  dns: '4',  
})

export const sendReservationEmail = async (toEmail, seatNumber, showtimeDate, startTime) => {
    const mailOptions = {
        from: `"Cinema Reservation" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Reservation Confirmation 🎬",
        html: `
            <h2>Reservation Successful</h2>
            <p>Your reservation has been confirmed.</p>
            <ul>
                <li><b>Seat:</b> ${seatNumber}</li>
                <li><b>Date:</b> ${showtimeDate}</li>
                <li><b>Time:</b> ${startTime}</li>
            </ul>
            <p>Enjoy the movie 🍿</p>
        `
    };

    await transporter.sendMail(mailOptions);
};
