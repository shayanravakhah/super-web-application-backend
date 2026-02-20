import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const EmailSender = async (
  toEmail,
  titleMovie,
  seatNumber,
  showtimeDate,
  startTime
) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: toEmail,
    subject: "Reservation Confirmation 🎬",
    html: `
      <h1>Reservation Successful</h1>
      <p>Your reservation has been confirmed.</p>
      <h3>${titleMovie}</h3>
      <ul>
        <li><b>Seat:</b> ${seatNumber}</li>
        <li><b>Date:</b> ${showtimeDate}</li>
        <li><b>Time:</b> ${startTime}</li>
      </ul>
      <p>Enjoy the movie 🍿</p>
    `,
  })
}