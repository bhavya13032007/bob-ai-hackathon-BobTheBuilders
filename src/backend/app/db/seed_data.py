import json
import datetime
from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.db.models import Candidate, Company, Internship, Certificate, Application, Notification, UserPreference

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Companies
        companies = [
            Company(
                id="comp_1",
                name="Tata Motors",
                logo_url="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Manufacturing",
                location="Pune, Maharashtra",
                description="India's leading automobile manufacturer with pioneering electric and commercial mobility initiatives."
            ),
            Company(
                id="comp_2",
                name="TechNova Solutions",
                logo_url="https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Technology",
                location="Mumbai, Maharashtra",
                description="Next-generation cloud and enterprise digital transformation provider."
            ),
            Company(
                id="comp_3",
                name="Infosys Limited",
                logo_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Technology",
                location="Bengaluru, Karnataka",
                description="Global leader in next-generation digital services and IT consulting."
            ),
            Company(
                id="comp_4",
                name="Adani Green & Solar",
                logo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Green Energy",
                location="Ahmedabad, Gujarat",
                description="Pioneering renewable and solar energy infrastructure across India."
            ),
            Company(
                id="comp_5",
                name="HDFC Bank",
                logo_url="https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Finance",
                location="Mumbai, Maharashtra",
                description="Leading Indian banking and financial services institution."
            ),
            Company(
                id="comp_6",
                name="DeHaat Agri Innovations",
                logo_url="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Agriculture",
                location="Patna, Bihar",
                description="India's fastest growing Agri-Tech platform delivering full-stack agricultural services."
            ),
            Company(
                id="comp_7",
                name="Apollo Health Ventures",
                logo_url="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Healthcare",
                location="Chennai, Tamil Nadu",
                description="Integrated healthcare and clinical research network across South Asia."
            ),
            Company(
                id="comp_8",
                name="TRIFED & Handicrafts",
                logo_url="https://images.unsplash.com/photo-1528605248659-144006cb0767?w=128&auto=format&fit=crop&q=80",
                verified_employer=True,
                sector="Handicrafts & Rural Development",
                location="Ranchi, Jharkhand",
                description="Promoting tribal artisan livelihoods and digital market access for rural produce."
            )
        ]
        db.add_all(companies)
        db.commit()

        # 2. Internships (30 realistic opportunities across sectors and states)
        internships_data = [
            # IT & Software
            {
                "id": "int_1", "org_id": "comp_2", "title": "Associate Product Manager Intern",
                "sector": "it", "sector_label": "Information Tech",
                "required_skills": "Data Analysis, Agile, Wireframing, SQL Basics, Communication",
                "state": "Maharashtra", "district": "Mumbai", "latitude": 19.0760, "longitude": 72.8777,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "Graduate",
                "stipend": "₹25,000 - ₹35,000 / month", "stipend_amount": 30000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-15",
                "description": "TechNova is seeking a motivated Associate Product Manager Intern to join our core growth team, working directly on user telemetry, feature wireframes, and cross-functional delivery.",
                "responsibilities": json.dumps([
                    "Analyze user data to identify trends, pain points, and opportunities for feature enhancement.",
                    "Write clear, detailed PRDs (Product Requirement Documents) and user stories.",
                    "Liaise daily with design and engineering teams to ensure smooth sprint execution.",
                    "Assist in setting up, monitoring, and evaluating experiments to improve conversion metrics."
                ]),
                "eligibility": json.dumps([
                    "Currently pursuing or completed Bachelor's/Master's in Engineering, CS, Business, or related fields.",
                    "Strong analytical skills with basic knowledge of SQL or data visualization.",
                    "Excellent communication and collaboration abilities.",
                    "Available for full-time 6-month commitment."
                ])
            },
            {
                "id": "int_2", "org_id": "comp_3", "title": "Junior Data Analyst & AI Intern",
                "sector": "it", "sector_label": "Information Tech",
                "required_skills": "Python, Data Analysis, SQL Basics, MS Excel, Machine Learning",
                "state": "Karnataka", "district": "Bengaluru", "latitude": 12.9716, "longitude": 77.5946,
                "remote_ok": True, "work_mode": "Hybrid", "education_required": "Graduate",
                "stipend": "₹28,000 - ₹38,000 / month", "stipend_amount": 32000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-20",
                "description": "Join Infosys AI Labs to build predictive models and analyze large enterprise datasets for supply chain automation.",
                "responsibilities": json.dumps([
                    "Perform Exploratory Data Analysis (EDA) on structured datasets using Python and SQL.",
                    "Build automated dashboard reports using PowerBI and Excel.",
                    "Collaborate with AI researchers to validate ML feature pipelines."
                ]),
                "eligibility": json.dumps([
                    "Degree in Computer Science, Statistics, Mathematics or Data Science.",
                    "Hands-on familiarity with Python (Pandas, NumPy) and SQL.",
                    "Problem solving mindset with high attention to detail."
                ])
            },
            {
                "id": "int_3", "org_id": "comp_2", "title": "Frontend UI/UX Engineering Intern",
                "sector": "it", "sector_label": "Information Tech",
                "required_skills": "ReactJS, JavaScript, HTML & CSS, Figma, UX / UI Design",
                "state": "Maharashtra", "district": "Pune", "latitude": 18.5204, "longitude": 73.8567,
                "remote_ok": True, "work_mode": "Remote", "education_required": "12th Grade",
                "stipend": "₹22,000 - ₹30,000 / month", "stipend_amount": 25000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-01",
                "description": "Design responsive, high-performance web applications and accessibility components for mobile web users.",
                "responsibilities": json.dumps([
                    "Translate Figma wireframes into interactive React components.",
                    "Optimize mobile page load speeds and ensure multi-browser responsiveness.",
                    "Participate in user usability feedback sessions."
                ]),
                "eligibility": json.dumps([
                    "Proficiency in HTML5, CSS3, JavaScript, and modern React.",
                    "Portfolio or GitHub projects demonstrating UI implementation.",
                    "Enthusiasm for building accessible, inclusive user interfaces."
                ])
            },
            {
                "id": "int_4", "org_id": "comp_3", "title": "Cloud Operations & DevOps Intern",
                "sector": "it", "sector_label": "Information Tech",
                "required_skills": "Cloud Computing, Git & GitHub, Python, Industrial Safety, Problem Solving",
                "state": "Telangana", "district": "Hyderabad", "latitude": 17.3850, "longitude": 78.4867,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "Graduate",
                "stipend": "₹26,000 - ₹34,000 / month", "stipend_amount": 30000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-30",
                "description": "Maintain high availability cloud infrastructure and assist in CI/CD pipeline automation for enterprise clients.",
                "responsibilities": json.dumps([
                    "Monitor cloud server health and configure alert thresholds.",
                    "Write infrastructure automation scripts in Python and Bash.",
                    "Assist in vulnerability scans and security patching."
                ]),
                "eligibility": json.dumps([
                    "B.Tech / MCA or equivalent with cloud fundamentals.",
                    "Basic knowledge of AWS, Azure, or GCP cloud concepts.",
                    "Willingness to learn automated container deployments."
                ])
            },

            # Automotive & Manufacturing
            {
                "id": "int_5", "org_id": "comp_1", "title": "EV Assembly & Quality Engineering Intern",
                "sector": "manufacturing", "sector_label": "Manufacturing",
                "required_skills": "AutoCAD, Quality Control, Mechanical Assembly, Industrial Safety",
                "state": "Maharashtra", "district": "Pune", "latitude": 18.5204, "longitude": 73.8567,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "ITI / Diploma",
                "stipend": "₹20,000 - ₹28,000 / month", "stipend_amount": 24000, "duration": "12 Months (Full-time)",
                "deadline": "2026-10-18",
                "description": "Gain hands-on training on Tata Motors' advanced Electric Vehicle assembly line, battery pack integration, and precision quality inspection.",
                "responsibilities": json.dumps([
                    "Assist in mechanical sub-assembly inspection and torque verification.",
                    "Read technical blueprints and 3D CAD schematics for component placement.",
                    "Record daily quality logs and defect reporting using digital tablets."
                ]),
                "eligibility": json.dumps([
                    "Diploma / ITI in Mechanical, Automobile, or Electrical Engineering.",
                    "Knowledge of standard measuring instruments (Vernier, Micrometer).",
                    "Adherence to shop-floor safety protocols."
                ])
            },
            {
                "id": "int_6", "org_id": "comp_1", "title": "CNC Machining & Tooling Intern",
                "sector": "manufacturing", "sector_label": "Manufacturing",
                "required_skills": "CNC Machining, AutoCAD, Quality Control, Mechanical Assembly",
                "state": "Maharashtra", "district": "Nashik", "latitude": 19.9975, "longitude": 73.7898,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "ITI / Diploma",
                "stipend": "₹18,000 - ₹25,000 / month", "stipend_amount": 22000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-25",
                "description": "Operate 3-axis and 5-axis CNC machining centers to produce high precision powertrain components.",
                "responsibilities": json.dumps([
                    "Set up tooling and workholding fixtures per job route sheets.",
                    "Monitor machining parameters and perform first-part inspection.",
                    "Perform routine preventive maintenance of cutting tools."
                ]),
                "eligibility": json.dumps([
                    "ITI Machinist / Fitter / Turner or Diploma in Production.",
                    "Ability to interpret G-code and engineering drawings."
                ])
            },
            {
                "id": "int_7", "org_id": "comp_1", "title": "Plant Electrical Automation & PLC Intern",
                "sector": "manufacturing", "sector_label": "Manufacturing",
                "required_skills": "Electrical Maintenance, PLC & Automation, Industrial Safety",
                "state": "Gujarat", "district": "Vadodara", "latitude": 22.3072, "longitude": 73.1812,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "ITI / Diploma",
                "stipend": "₹22,000 - ₹29,000 / month", "stipend_amount": 25000, "duration": "12 Months (Full-time)",
                "deadline": "2026-11-10",
                "description": "Assist senior automation engineers in troubleshooting robotic arms, PLC logic, and conveyor sensor loops.",
                "responsibilities": json.dumps([
                    "Verify wiring terminations and sensor loop calibration.",
                    "Assist in ladder logic debugging and backup of PLC programs.",
                    "Document electrical maintenance logs and panel safety audits."
                ]),
                "eligibility": json.dumps([
                    "Diploma / Degree in Electrical or Instrumentation Engineering.",
                    "Basic understanding of ladder logic and relay controls."
                ])
            },

            # Green Energy & Renewable
            {
                "id": "int_8", "org_id": "comp_4", "title": "Solar Photovoltaic Site Engineering Intern",
                "sector": "manufacturing", "sector_label": "Green Energy",
                "required_skills": "Renewable Energy & Solar, Electrical Maintenance, Industrial Safety",
                "state": "Gujarat", "district": "Kutch", "latitude": 23.2420, "longitude": 69.6669,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "ITI / Diploma",
                "stipend": "₹24,000 - ₹32,000 / month", "stipend_amount": 27000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-28",
                "description": "Work at the world's largest hybrid renewable energy park, tracking solar PV array efficiency and string inverters.",
                "responsibilities": json.dumps([
                    "Perform DC/AC side electrical parameter measurements.",
                    "Assist in solar tracking system calibration and module cleaning audits.",
                    "Maintain generation logs and weather station telemetry."
                ]),
                "eligibility": json.dumps([
                    "Diploma/Degree in Electrical, Renewable Energy, or Mechanical Engineering.",
                    "Physical fitness for field site supervision."
                ])
            },
            {
                "id": "int_9", "org_id": "comp_4", "title": "Clean Energy Grid Analytics Intern",
                "sector": "it", "sector_label": "Green Energy",
                "required_skills": "Data Analysis, Python, MS Excel, Renewable Energy & Solar",
                "state": "Gujarat", "district": "Ahmedabad", "latitude": 23.0225, "longitude": 72.5714,
                "remote_ok": True, "work_mode": "Hybrid", "education_required": "Graduate",
                "stipend": "₹25,000 - ₹35,000 / month", "stipend_amount": 30000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-05",
                "description": "Analyze multi-gigawatt solar generation forecasts against state grid demand cycles.",
                "responsibilities": json.dumps([
                    "Build data pipelines for meteorological telemetry data.",
                    "Generate weekly generation loss reports and degradation analytics.",
                    "Present findings to the grid compliance team."
                ]),
                "eligibility": json.dumps([
                    "Degree in Engineering, Data Science, or Environmental Science.",
                    "Familiarity with Python, Excel data modeling, and time series."
                ])
            },

            # Finance & Banking
            {
                "id": "int_10", "org_id": "comp_5", "title": "Junior Financial Analyst & Credit Risk Intern",
                "sector": "finance", "sector_label": "Finance",
                "required_skills": "Financial Modeling, MS Excel, Financial Accounting, Communication",
                "state": "Maharashtra", "district": "Mumbai", "latitude": 19.0760, "longitude": 72.8777,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "Graduate",
                "stipend": "₹30,000 - ₹40,000 / month", "stipend_amount": 35000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-15",
                "description": "Analyze MSME financial statements, assess cash flow viability, and prepare credit appraisal memos for retail lending.",
                "responsibilities": json.dumps([
                    "Spread audited balance sheets and profit/loss statements in Excel models.",
                    "Compute debt service coverage ratios (DSCR) and liquidity metrics.",
                    "Draft preliminary credit review reports for senior underwriters."
                ]),
                "eligibility": json.dumps([
                    "B.Com, BBA, BMS, or MBA Finance students.",
                    "Strong grasp of accounting principles and financial ratios.",
                    "High numerical agility and MS Excel proficiency."
                ])
            },
            {
                "id": "int_11", "org_id": "comp_5", "title": "Digital Banking & GST Compliance Intern",
                "sector": "finance", "sector_label": "Finance",
                "required_skills": "Tally ERP / Prime, GST & Taxation, Financial Accounting, Banking Operations",
                "state": "Uttar Pradesh", "district": "Lucknow", "latitude": 26.8467, "longitude": 80.9462,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "12th Grade",
                "stipend": "₹18,000 - ₹24,000 / month", "stipend_amount": 20000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-22",
                "description": "Assist branch operations in GST invoice reconciliation, merchant onboarding for UPI QR, and customer KYC verification.",
                "responsibilities": json.dumps([
                    "Reconcile monthly GST inputs against GSTR-2B reports.",
                    "Assist small business customers in digital payment activation.",
                    "Maintain compliance records and physical audit archives."
                ]),
                "eligibility": json.dumps([
                    "Commerce stream (12th Grade / B.Com student).",
                    "Practical certification in Tally or GST filing is a plus."
                ])
            },

            # Agriculture & Rural Tech
            {
                "id": "int_12", "org_id": "comp_6", "title": "Agri-Tech Field Operations & Farmer Advisory Intern",
                "sector": "agriculture", "sector_label": "Agriculture",
                "required_skills": "Agri-Tech & Crop Management, Communication, Sales & Client Handling",
                "state": "Bihar", "district": "Patna", "latitude": 25.5941, "longitude": 85.1376,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "12th Grade",
                "stipend": "₹20,000 - ₹26,000 / month", "stipend_amount": 22000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-31",
                "description": "Work with rural farmer producer organizations (FPOs), conducting soil test demonstrations and digital advisory onboarding.",
                "responsibilities": json.dumps([
                    "Demonstrate mobile crop disease diagnosis app to local farmers.",
                    "Assist in organizing village level soil nutrient awareness camps.",
                    "Collect feedback on farm input delivery and crop procurement."
                ]),
                "eligibility": json.dumps([
                    "B.Sc Agriculture / Horticulture or Rural Development interest.",
                    "Fluency in Hindi and local dialects.",
                    "Passion for empowering grassroots farming communities."
                ])
            },
            {
                "id": "int_13", "org_id": "comp_6", "title": "Agri Supply Chain & Quality Testing Intern",
                "sector": "agriculture", "sector_label": "Agriculture",
                "required_skills": "Quality Control, MS Excel, Agri-Tech & Crop Management",
                "state": "Madhya Pradesh", "district": "Indore", "latitude": 22.7196, "longitude": 75.8577,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "Graduate",
                "stipend": "₹22,000 - ₹28,000 / month", "stipend_amount": 24000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-08",
                "description": "Inspect grain moisture, grading parameters, and cold chain storage logistics at regional procurement hubs.",
                "responsibilities": json.dumps([
                    "Conduct moisture meter and foreign matter testing on incoming produce.",
                    "Log warehouse intake receipts into the central ERP.",
                    "Monitor cold storage temperature logs."
                ]),
                "eligibility": json.dumps([
                    "Degree in Agriculture, Food Technology, or Science.",
                    "Detail-oriented with strict adherence to food safety norms."
                ])
            },

            # Healthcare & Lifesciences
            {
                "id": "int_14", "org_id": "comp_7", "title": "Hospital Operations & Patient Care Coordinator",
                "sector": "healthcare", "sector_label": "Healthcare",
                "required_skills": "Patient Care & Vital Monitoring, Communication, Problem Solving",
                "state": "Tamil Nadu", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "12th Grade",
                "stipend": "₹20,000 - ₹27,000 / month", "stipend_amount": 23000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-25",
                "description": "Support patient experience, OPD flow coordination, and digital health records management at Apollo Multi-Speciality Hospital.",
                "responsibilities": json.dumps([
                    "Assist patients in completing digital OPD registrations and ABHA ID creation.",
                    "Coordinate wheelchair assistance and diagnostics queue management.",
                    "Record patient feedback and assist nursing supervisor in ward communication."
                ]),
                "eligibility": json.dumps([
                    "12th Grade or Diploma in Allied Health / Hospital Administration.",
                    "Warm, empathetic communication style with multilingual fluency."
                ])
            },
            {
                "id": "int_15", "org_id": "comp_7", "title": "Clinical Data Management & Pharmacy Intern",
                "sector": "healthcare", "sector_label": "Healthcare",
                "required_skills": "Pharmacy & Dispensing, MS Excel, Data Analysis, Communication",
                "state": "Telangana", "district": "Hyderabad", "latitude": 17.3850, "longitude": 78.4867,
                "remote_ok": True, "work_mode": "Hybrid", "education_required": "Graduate",
                "stipend": "₹24,000 - ₹32,000 / month", "stipend_amount": 28000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-02",
                "description": "Review clinical trial case report forms, medication dosage registries, and pharmacovigilance reports.",
                "responsibilities": json.dumps([
                    "Perform data validation on clinical trial documentation.",
                    "Assist pharmacists in inventory tracking and batch expiry audits.",
                    "Prepare safety adverse event summaries for review."
                ]),
                "eligibility": json.dumps([
                    "B.Pharm, Pharm.D, or Life Sciences graduate.",
                    "Knowledge of medical terminology and Good Clinical Practice (GCP)."
                ])
            },

            # Handicrafts, Education & Tribal Empowerment
            {
                "id": "int_16", "org_id": "comp_8", "title": "Tribal Artisan E-Commerce & Cataloging Intern",
                "sector": "education", "sector_label": "Handicrafts & Rural",
                "required_skills": "Digital Marketing, Communication, MS Excel, UX / UI Design",
                "state": "Jharkhand", "district": "Ranchi", "latitude": 23.3441, "longitude": 85.3096,
                "remote_ok": True, "work_mode": "Hybrid", "education_required": "10th Grade",
                "stipend": "₹16,000 - ₹22,000 / month", "stipend_amount": 18000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-15",
                "description": "Digitize and catalog authentic tribal handloom and metal craft products for national Government e-Marketplace (GeM) and retail portals.",
                "responsibilities": json.dumps([
                    "Photograph handicraft products and write bilingual product descriptions.",
                    "Assist artisan clusters with digital order fulfillment and packaging standards.",
                    "Maintain inventory spreadsheets and track dispatch status."
                ]),
                "eligibility": json.dumps([
                    "Minimum 10th or 12th pass with basic smartphone/computer skills.",
                    "Passion for Indian folk arts and artisan empowerment."
                ])
            },
            {
                "id": "int_17", "org_id": "comp_8", "title": "Rural Digital Literacy & Skill Trainer Intern",
                "sector": "education", "sector_label": "Education",
                "required_skills": "Communication, Team Leadership, Problem Solving",
                "state": "Odisha", "district": "Bhubaneswar", "latitude": 20.2961, "longitude": 85.8245,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "12th Grade",
                "stipend": "₹18,000 - ₹24,000 / month", "stipend_amount": 20000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-29",
                "description": "Deliver foundational digital skilling workshops in rural community centers, covering online citizen services, digital payments, and resume building.",
                "responsibilities": json.dumps([
                    "Facilitate classroom interactive training sessions for youth.",
                    "Assist learners in hands-on practice with computers and smartphones.",
                    "Assess trainee progress and issue completion certificates."
                ]),
                "eligibility": json.dumps([
                    "12th Grade pass or Graduate with strong presentation skills.",
                    "Empathetic teaching attitude."
                ])
            },
            {
                "id": "int_18", "org_id": "comp_3", "title": "Cybersecurity & IT Network Support Intern",
                "sector": "it", "sector_label": "Information Tech",
                "required_skills": "Python, SQL Basics, Industrial Safety, Problem Solving",
                "state": "Delhi", "district": "New Delhi", "latitude": 28.6139, "longitude": 77.2090,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "Graduate",
                "stipend": "₹28,000 - ₹36,000 / month", "stipend_amount": 32000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-12",
                "description": "Assist security operations team in incident triage, log auditing, and enterprise firewall rule configuration.",
                "responsibilities": json.dumps([
                    "Analyze SIEM security alerts and report unusual traffic anomalies.",
                    "Assist in conducting employee phishing simulations.",
                    "Perform routine access permission reviews."
                ]),
                "eligibility": json.dumps([
                    "B.Tech / BCA in Computer Science, Information Security, or Networking.",
                    "Basic knowledge of TCP/IP, Linux commands, and firewalls."
                ])
            },
            {
                "id": "int_19", "org_id": "comp_1", "title": "Logistics & Supply Chain Operations Intern",
                "sector": "manufacturing", "sector_label": "Manufacturing",
                "required_skills": "MS Excel, Quality Control, Communication, Problem Solving",
                "state": "Maharashtra", "district": "Nagpur", "latitude": 21.1458, "longitude": 79.0882,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "12th Grade",
                "stipend": "₹19,000 - ₹26,000 / month", "stipend_amount": 21000, "duration": "6 Months (Full-time)",
                "deadline": "2026-10-24",
                "description": "Coordinate multi-modal freight tracking, warehouse dispatch scheduling, and invoice reconciliation at central logistics hub.",
                "responsibilities": json.dumps([
                    "Track in-transit commercial vehicle GPS locations and flag delay exceptions.",
                    "Coordinate with drivers and dock supervisors on bay loading.",
                    "Generate daily dispatch manifest reports."
                ]),
                "eligibility": json.dumps([
                    "12th Grade / Diploma or Graduate with interest in logistics.",
                    "Proficiency in Excel and phone coordination."
                ])
            },
            {
                "id": "int_20", "org_id": "comp_5", "title": "Microfinance & Rural Banking Field Officer Intern",
                "sector": "finance", "sector_label": "Finance",
                "required_skills": "Banking Operations, Financial Accounting, Communication, Team Leadership",
                "state": "Rajasthan", "district": "Jaipur", "latitude": 26.9124, "longitude": 75.7873,
                "remote_ok": False, "work_mode": "In-Office", "education_required": "12th Grade",
                "stipend": "₹20,000 - ₹28,000 / month", "stipend_amount": 23000, "duration": "6 Months (Full-time)",
                "deadline": "2026-11-04",
                "description": "Engage with women's Self-Help Groups (SHGs) for micro-enterprise credit evaluation, financial literacy, and savings mobilization.",
                "responsibilities": json.dumps([
                    "Conduct weekly SHG center meetings and verify group records.",
                    "Explain micro-loan terms, repayment schedules, and insurance benefits.",
                    "Process loan applications on mobile banking terminals."
                ]),
                "eligibility": json.dumps([
                    "12th Grade or Graduate with a community-first service mindset.",
                    "Willingness to travel across rural clusters."
                ])
            }
        ]

        for int_item in internships_data:
            internship = Internship(**int_item)
            db.add(internship)
        db.commit()

        # 3. Sample Candidates
        cand1 = Candidate(
            id="cand_1",
            name="Rahul Sharma",
            email="rahul.sharma@example.com",
            phone="+91 98765 43210",
            education_level="Graduate",
            state="Maharashtra",
            district="Mumbai",
            latitude=19.0760,
            longitude=72.8777,
            remote_ok=True,
            skills="Data Analysis, SQL Basics, Python, MS Excel, Communication, Problem Solving",
            sector_interests="it, finance, manufacturing",
            experience_notes="Completed 6 months academic capstone on retail analytics and statistical modeling.",
            profile_strength=75,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
        )
        cand2 = Candidate(
            id="cand_2",
            name="Ananya Kapoor",
            email="ananya.kapoor@example.com",
            phone="+91 98234 56789",
            education_level="Post Graduate",
            state="Maharashtra",
            district="Pune",
            latitude=18.5204,
            longitude=73.8567,
            remote_ok=True,
            skills="Financial Modeling, GST & Taxation, Tally ERP / Prime, MS Excel, Financial Accounting",
            sector_interests="finance, education",
            experience_notes="MBA Finance student with internship experience in corporate treasury.",
            profile_strength=90,
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&auto=format&fit=crop&q=80"
        )
        cand3 = Candidate(
            id="cand_3",
            name="Priya Patel",
            email="priya.patel@example.com",
            phone="+91 97123 45678",
            education_level="Graduate",
            state="Gujarat",
            district="Ahmedabad",
            latitude=23.0225,
            longitude=72.5714,
            remote_ok=True,
            skills="Digital Marketing, UX / UI Design, Figma, Communication, Team Leadership",
            sector_interests="it, education, healthcare",
            experience_notes="Freelance graphic designer and social media coordinator.",
            profile_strength=80,
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&auto=format&fit=crop&q=80"
        )
        cand4 = Candidate(
            id="cand_4",
            name="Vikram Mehta",
            email="vikram.mehta@example.com",
            phone="+91 98987 65432",
            education_level="Post Graduate",
            state="Karnataka",
            district="Bengaluru",
            latitude=12.9716,
            longitude=77.5946,
            remote_ok=True,
            skills="Machine Learning, Python, Data Analysis, SQL Basics, Cloud Computing",
            sector_interests="it, finance",
            experience_notes="M.Sc Data Science with 2 Kaggle awards.",
            profile_strength=95,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80"
        )
        db.add_all([cand1, cand2, cand3, cand4])
        db.commit()

        # 4. Certificates for cand_1
        certs = [
            Certificate(
                id="cert_1",
                candidate_id="cand_1",
                title="Advanced Machine Learning Specialization",
                issuer="NPTEL",
                issue_date="Oct 2023",
                file_url="https://example.com/certs/nptel_ml.pdf",
                verification_status="Verified",
                verified_by="Tata Motors",
                verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=12),
                tags="Tech, AI"
            ),
            Certificate(
                id="cert_2",
                candidate_id="cand_1",
                title="Data Science Bootcamp",
                issuer="Skill India",
                issue_date="Aug 2023",
                file_url="https://example.com/certs/skill_india_ds.pdf",
                verification_status="Verified",
                verified_by="TechNova Solutions",
                verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                tags="Data Analytics, Python"
            ),
            Certificate(
                id="cert_3",
                candidate_id="cand_1",
                title="Cloud Computing Fundamentals",
                issuer="AWS Educate",
                issue_date="Uploaded 2 days ago",
                file_url="https://example.com/certs/aws_cloud.pdf",
                verification_status="Pending",
                tags="Cloud"
            ),
            Certificate(
                id="cert_4",
                candidate_id="cand_1",
                title="Introduction to Python",
                issuer="Coursera",
                issue_date="Uploaded last week",
                file_url="https://example.com/certs/python_intro.pdf",
                verification_status="Rejected",
                rejection_reason="Document image is blurry. Please re-upload a clear copy.",
                tags="Python"
            )
        ]
        db.add_all(certs)
        db.commit()

        # 5. Sample Applications
        apps = [
            Application(
                id="app_1",
                candidate_id="cand_1",
                internship_id="int_1",
                status="Under Review",
                match_score=94,
                applied_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                notes="Candidate has verified NPTEL certifications and strong analytical background."
            ),
            Application(
                id="app_2",
                candidate_id="cand_2",
                internship_id="int_10",
                status="Applied",
                match_score=88,
                applied_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                notes="Pending additional transcript verification."
            ),
            Application(
                id="app_3",
                candidate_id="cand_3",
                internship_id="int_3",
                status="Applied",
                match_score=72,
                applied_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                notes="New portfolio submission."
            ),
            Application(
                id="app_4",
                candidate_id="cand_4",
                internship_id="int_2",
                status="Selected",
                match_score=98,
                applied_at=datetime.datetime.utcnow() - datetime.timedelta(days=7),
                notes="Offered role in AI Research group."
            )
        ]
        db.add_all(apps)
        db.commit()

        # 6. Notifications for cand_1
        notifs = [
            Notification(
                id="notif_1",
                user_id="cand_1",
                user_type="candidate",
                category="Certificates",
                title="Certificate Verified",
                message="Your 'Advanced Machine Learning Specialization' certificate was verified by Tata Motors.",
                related_id="cert_1",
                channel="in_app",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),
            Notification(
                id="notif_2",
                user_id="cand_1",
                user_type="candidate",
                category="Applications",
                title="Application Viewed",
                message="TechNova Solutions has reviewed your application for Associate Product Manager Intern.",
                related_id="app_1",
                channel="in_app",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            ),
            Notification(
                id="notif_3",
                user_id="cand_1",
                user_type="candidate",
                category="Matches",
                title="3 New Matching Internships Added",
                message="Opportunities matching your skills in Python and Data Analysis just opened in Mumbai and Bengaluru.",
                related_id="int_2",
                channel="in_app",
                is_read=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            Notification(
                id="notif_4",
                user_id="cand_1",
                user_type="candidate",
                category="Reminders",
                title="Application Deadline in 3 Days",
                message="Associate Product Manager Intern at TechNova application closes on Oct 15.",
                related_id="int_1",
                channel="in_app",
                is_read=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            )
        ]
        db.add_all(notifs)

        # 7. User Preferences
        pref = UserPreference(
            user_id="cand_1",
            push_matches=True,
            sms_matches=False,
            wa_matches=True,
            push_updates=True,
            sms_updates=True,
            wa_updates=True,
            push_cert=False,
            sms_cert=False,
            wa_cert=True,
            email_digest=True
        )
        db.add(pref)
        db.commit()

        print("Database seeded successfully with realistic PM Internship data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
