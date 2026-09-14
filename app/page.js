"use client";

import Image from "next/image";
import { useState } from "react";

const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-6 6 6-6 6" /></svg>;
const SlabMark = () => <svg className="brand-mark" viewBox="0 0 58 58" aria-hidden="true"><path d="m7 38 22-11 22 11-22 11Z" /><path d="m7 30 22-11 22 11M7 22 29 11l22 11" /></svg>;
const projectOptions = ["New driveway", "Driveway replacement", "Patio or outdoor living", "Sidewalk or walkway", "Garage or shed slab", "Foundation or footing", "Decorative or stamped concrete", "Concrete repair", "Steps or porch", "Estimate or budget question", "Not sure — I need some advice", "Something else"];

function LeadForm({ compact = false }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  async function submitLead(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = new FormData(form);
    const firstName = String(payload.get("firstName") || "").trim();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/lead", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send your request.");
      setStatus("success");
      setMessage(`Thanks, ${firstName}! We received your project request. Someone from Stone & Set Concrete will be in touch shortly.`);
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  }
  return <form className={`lead-form ${compact ? "compact" : ""}`} onSubmit={submitLead}>
    <input className="honey" name="formCheck" tabIndex="-1" autoComplete="new-password" aria-hidden="true" />
    <input type="hidden" name="source" value={compact ? "bottom-form" : "primary-form"} />
    <div className="form-row"><label>First name *<input name="firstName" autoComplete="given-name" required placeholder="First name" /></label><label>Last name *<input name="lastName" autoComplete="family-name" required placeholder="Last name" /></label></div>
    <div className="form-row"><label>Phone *<input name="phone" type="tel" autoComplete="tel" required placeholder="(555) 555-0123" /></label><label>Email *<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label></div>
    <div className="form-row split-small"><label>ZIP code *<input name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength="5" required placeholder="00000" /></label><label>What can we help with? *<select name="service" required defaultValue=""><option value="" disabled>Select your project</option>{projectOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div>
    {!compact && <><label>Tell us about your project<textarea name="details" rows="3" placeholder="What would you like poured, replaced, or repaired? Share timing or questions if you know them." /></label><label className="file-field">Have a photo of the area? <span>(optional)</span><span className="file-control"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4M5 14v5h14v-5" /></svg><span>Upload the driveway, patio, damage, or site</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" /></span><small>JPG, PNG, WEBP, or HEIC up to 4 MB.</small></label></>}
    <label className="consent-check"><input name="smsConsent" type="checkbox" value="yes" /><span>Text me about my request</span></label>
    <p className="sms-disclosure">By checking this box, you agree to receive text messages from Stone & Set Concrete about your request. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.</p>
    <button className="button button-copper form-submit" disabled={status === "loading"}>{status === "loading" ? "Sending…" : "Send my request"}<Arrow /></button>
    <p className="form-note">No pressure. Your details are used only to respond to your request.</p>
    {message && <p className={`form-message ${status}`} role="status">{message}</p>}
  </form>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  function chooseService(service) {
    const form = document.querySelector("#start-project .lead-form");
    if (form) form.elements.service.value = service;
    document.querySelector("#start-project")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => form?.elements.firstName?.focus({ preventScroll: true }), 550);
  }
  const services = [
    ["01", "Driveways", "New pours and full replacements planned for everyday use, clean drainage, and lasting curb appeal."],
    ["02", "Patios & outdoor living", "Straightforward patios, decorative finishes, and gathering spaces shaped around how you use the yard."],
    ["03", "Walkways, steps & porches", "Safe, well-finished paths and entries that connect the important parts of your property."],
    ["04", "Slabs & foundations", "Garage floors, shed pads, footings, and foundations prepared carefully for what comes next."],
    ["05", "Decorative concrete", "Stamped patterns, borders, and color options that add character without giving up durability."],
    ["06", "Concrete repair", "Practical guidance for cracked, settled, or worn concrete—and when replacement makes more sense."],
  ];
  const serviceValues = { Driveways: "New driveway", "Patios & outdoor living": "Patio or outdoor living", "Walkways, steps & porches": "Sidewalk or walkway", "Slabs & foundations": "Garage or shed slab", "Decorative concrete": "Decorative or stamped concrete", "Concrete repair": "Concrete repair" };

  return <main>
    <div className="announcement"><span>Residential concrete work for Central Indiana and surrounding counties.</span></div>
    <header className="site-header"><a className="brand" href="#top" aria-label="Stone and Set Concrete home"><SlabMark /><span><b>STONE <span>&</span> SET</b><small>CONCRETE</small></span></a><nav className={menuOpen ? "open" : ""} aria-label="Main navigation"><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#approach" onClick={() => setMenuOpen(false)}>Our approach</a><a href="#process" onClick={() => setMenuOpen(false)}>Process</a><a href="#possibilities" onClick={() => setMenuOpen(false)}>Project ideas</a></nav><a className="button button-ink header-cta" href="#start-project">Tell us about your project <Arrow /></a><button className="menu-button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button></header>

    <section className="hero" id="top"><Image src="/images/concrete-hero.png" alt="Finished concrete driveway at a Midwestern home" fill priority loading="eager" sizes="100vw" /><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow light">DRIVEWAYS · PATIOS · SLABS</p><h1>Concrete work done right. From the ground up.</h1><p>Driveways, patios, walkways, slabs, and repairs built with a clear plan and a finish made to last.</p><a className="button button-copper" href="#start-project">Tell us about your project <Arrow /></a><div className="hero-promises"><span><i>01</i>Straight answers</span><span><i>02</i>Careful preparation</span><span><i>03</i>A clean finish</span></div></div></section>

    <section className="lead-section" id="start-project"><div className="lead-intro"><p className="eyebrow">YOUR PROJECT STARTS HERE</p><h2>Tell us what you need poured, replaced, or repaired.</h2><p>You do not need measurements, drawings, or all the answers. Share what you are working with and we’ll help you figure out the right next step.</p><div className="owner-alert"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6" /></svg></span><p><b>Your request won’t sit in an inbox.</b><br />The owner is notified immediately by text and email.</p></div></div><div className="form-card"><div className="form-title"><span>LET’S TALK THROUGH IT</span><strong>Start your project conversation</strong></div><LeadForm /></div></section>

    <section className="values-strip"><article><b>Solid prep</b><span>A dependable pour starts below the surface</span></article><article><b>Clear scope</b><span>Know what is included before work begins</span></article><article><b>Built for Indiana</b><span>Planning for weather, drainage, and daily use</span></article><article><b>Clean site</b><span>Respect for your property from start to finish</span></article></section>

    <section className="services section" id="services"><div className="section-head"><div><p className="eyebrow">WHAT WE POUR</p><h2>Concrete services for the way you use your property.</h2></div><p>Good concrete is practical first. It should drain well, hold up to real life, and look like it belongs with your home.</p></div><div className="service-grid">{services.map(([number, title, copy]) => <article className="service-card" key={title}><span>{number}</span><h3>{title}</h3><p>{copy}</p><button onClick={() => chooseService(serviceValues[title])}>Ask about this project <Arrow /></button></article>)}</div></section>

    <section className="approach" id="approach"><div className="approach-image"><Image src="/images/concrete-pour.png" alt="Concrete crew placing and finishing a residential slab" fill sizes="(max-width: 850px) 100vw, 52vw" /><div className="image-note"><b>Prepare well. Pour carefully.</b><span>The finish starts with everything underneath it.</span></div></div><div className="approach-copy"><p className="eyebrow light">THE STONE & SET APPROACH</p><h2>The finish is only as good as what is underneath.</h2><p>Concrete has to look good on day one and keep doing its job through years of traffic and Indiana weather. That takes careful site preparation, sensible drainage, the right reinforcement, and attention while the concrete is placed and finished.</p><ul><li><span>01</span><div><b>Prepare the base</b><p>Excavate, grade, and compact for dependable support.</p></div></li><li><span>02</span><div><b>Plan the water</b><p>Build in slope and drainage that protect the new work.</p></div></li><li><span>03</span><div><b>Reinforce the pour</b><p>Match reinforcement and thickness to the project.</p></div></li><li><span>04</span><div><b>Finish with care</b><p>Control joints, edges, texture, and curing all matter.</p></div></li></ul><a href="#start-project" className="line-link">Start a real conversation <Arrow /></a></div></section>

    <section className="process section" id="process"><div className="section-head process-head"><div><p className="eyebrow">HOW IT COMES TOGETHER</p><h2>A clear path from rough idea to finished concrete.</h2></div></div><div className="process-grid">{[["01","Share the project","Tell us what you want to pour, what needs to come out, or what problem you are trying to solve."],["02","See the site","We look at access, grade, drainage, dimensions, and the practical details that shape the work."],["03","Confirm the plan","Scope, finish, timing, and expectations are clear before equipment arrives."],["04","Pour & finish","The site is prepared, concrete is placed with care, and you know how to protect it while it cures."]].map(([n,t,c]) => <article key={n}><span>{n}</span><div><h3>{t}</h3><p>{c}</p></div></article>)}</div></section>

    <section className="possibilities" id="possibilities"><div className="possibilities-copy"><p className="eyebrow light">PROJECT IDEAS</p><h2>Concrete that earns its place.</h2><p>Make the everyday route smoother, create a place to gather, or build a solid start for the next project.</p><a href="#start-project" className="line-link">Tell us what you need <Arrow /></a></div><div className="project-grid"><button className="project large" onClick={() => chooseService("New driveway")}><Image src="/images/concrete-hero.png" alt="Finished residential concrete driveway" fill sizes="(max-width: 700px) 100vw, 52vw" /><span><small>DRIVEWAYS</small>Make coming home feel better <Arrow /></span></button><button className="project" onClick={() => chooseService("Patio or outdoor living")}><Image src="/images/concrete-patio.png" alt="Stamped concrete patio with a fire pit" fill sizes="(max-width: 700px) 100vw, 35vw" /><span><small>PATIOS</small>Create a place to gather <Arrow /></span></button><button className="project" onClick={() => chooseService("Garage or shed slab")}><Image src="/images/concrete-pour.png" alt="Concrete slab being placed and finished" fill sizes="(max-width: 700px) 100vw, 35vw" /><span><small>SLABS & FOUNDATIONS</small>Start the next project solid <Arrow /></span></button></div></section>

    <section className="expectations"><div><p className="eyebrow">WHAT GOOD CONCRETE WORK SHOULD FEEL LIKE</p><h2>Prepared. Precise. Built to hold up.</h2></div><div className="expectation-list"><article><b>Know what happens next.</b><p>A clear schedule and honest updates keep the work manageable.</p></article><article><b>Understand what you are getting.</b><p>Thickness, reinforcement, finish, and drainage should never be a mystery.</p></article><article><b>Feel good about the finished site.</b><p>Clean edges, careful cleanup, and useful care instructions finish the job.</p></article></div></section>

    <section className="final-cta"><div><p className="eyebrow light">BRING US THE QUESTION</p><h2>You don’t need every detail to get started.</h2><p>Send a few details about the space, the damage, or what you hope to build. We’ll help you understand what comes next.</p></div><div className="form-card bottom"><div className="form-title"><span>START HERE</span><strong>Tell us about your project</strong></div><LeadForm compact /></div></section>

    <footer><div className="footer-main"><a className="brand footer-brand" href="#top"><SlabMark /><span><b>STONE <span>&</span> SET</b><small>CONCRETE</small></span></a><p>Solid concrete work, built for everyday life.</p><div className="footer-links"><div><b>Explore</b><a href="#services">Services</a><a href="#approach">Our approach</a><a href="#process">Process</a></div><div><b>Start</b><a href="#start-project">Project conversation</a><a href="#possibilities">Project ideas</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Stone & Set Concrete. All rights reserved. · <a href="/privacy">Privacy</a></span><span>Serving Central Indiana.</span></div></footer>
  </main>;
}
