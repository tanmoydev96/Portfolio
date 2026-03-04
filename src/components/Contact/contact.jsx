import { useRef } from "react";
import emailjs from "@emailjs/browser";
import "./contact.css";

const Contact = () => {
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        emailjs
            .sendForm(
                "service_usdc2sf",
                "template_xhej1np",
                form.current,
                "wSLRzYCVmeRjoTsVj"
            )
            .then(
                () => {
                    alert("Message sent successfully ✅");
                    form.current.reset();
                },
                () => {
                    alert("Failed to send message ❌");
                }
            );
    };

    return (
        <section className="contact section" id="contact">
            <h2 className="section__title">Contact</h2>
            <span className="section__subtitle">Let’s work together</span>

            <div className="contact__container">
                <div className="contact__card">

                    <div className="contact__info">
                        <h3>Get In Touch</h3>
                        <p>I’m open to freelance, full-time, or collaboration opportunities.</p>
                    </div>

                    <form ref={form} onSubmit={sendEmail} className="contact__form">
                        <input
                            type="text"
                            name="from_name"
                            placeholder="Your Name"
                            required
                        />

                        <input
                            type="email"
                            name="from_email"
                            placeholder="Your Email"
                            required
                        />

                        <textarea
                            name="message"
                            placeholder="Your Message"
                            required
                        ></textarea>

                        <button type="submit">Send Message</button>
                    </form>

                </div>
            </div>
        </section>
    );
};

export default Contact;