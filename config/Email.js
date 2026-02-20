import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const EmailSender = async (
  toEmail,
  seatNumber,
  showtimeDate,
  startTime
) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
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
    `,
  })
}