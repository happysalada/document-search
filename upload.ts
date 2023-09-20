import { HfInference } from "@huggingface/inference";
import { getEncoding } from "js-tiktoken";
import { QdrantClient } from "@qdrant/qdrant-js";

// Replace with your actual Hugging Face API token
const CHUNK_SIZE: number = 512;
const COLLECTION: string = "agora_anonymised_2";
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);
const client = new QdrantClient({
  host: "127.0.0.1",
  port: 6333,
});

type Document = { text: string; payload: Record<string, object> };

// Function to split an array into chunks
const chunkArray = (array: number[], size: number): number[][] => {
  const chunks: number[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const main = async (documents: Document[]): Promise<void> => {
  await client.createCollection(COLLECTION, {
    vectors: {
      size: 768,
      distance: "Cosine",
    },
  });

  // Get BPE encoding
  const encoding = getEncoding("cl100k_base");

  documents.map(async ({ text, payload }, documentIndex) => {
    await Promise.all(
      chunkArray(encoding.encode(text), CHUNK_SIZE)
        .map((chunk) => encoding.decode(chunk))
        .map(async (chunk, chunkIndex) => {
          let embeddings = (await hf.featureExtraction({
            model: "BAAI/bge-base-en-v1.5",
            inputs: chunk,
          })) as number[];

          const qdrantResult = await client.upsert(COLLECTION, {
            wait: true,
            points: [
              {
                id: documentIndex * 10 + chunkIndex,
                vector: embeddings,
                payload,
              },
            ],
          });
          console.log(qdrantResult);
        })
    );
  });
};

const documents: Document[] = [
  {
    text: `
January 24, 2022

Dear,
 
Thank you for providing SUPPLIER Consulting, LLP (“SUPPLIER Consulting”) with the opportunity to continue to assist with FINANCE TRANSFORMATION (FT), supporting the corporate “FUTURE OF FINANCE” strategy.  We have provided this Statement of Work (“SOW”) summarizing your requested assistance for the calendar year.  This SOW, dated January 24, 2022, between BUYER & Co., Inc. ("BUYER") and SUPPLIER Consulting LLP ("SUPPLIER", "Consultant" or "Supplier") is an attachment to that certain Consulting Services Agreement, made and entered into as of February 29, 2015, between BUYER and Supplier (the "Agreement").

Background

As part of its “FUTURE OF FINANCE” strategy, BUYER is committed to creating a “Lean and Flexible Business Model” through the integration of its global support functions and transformation of its business support capabilities via the Global Support Functions (GSF) initiative.  In support of the execution of this strategy, BUYER Finance is undergoing a global Finance transformation.    

In July 2015, BUYER Finance (partnering with SUPPLIER) completed Phase 1 of its Global Finance Transformation effort including: 
Design of the future-state Global Finance Operating Model in line with leading practices and GSF objectives of efficiency, effectiveness, and global capabilities development
Determination of the directional cost structure and order of magnitude cost savings as a result of transition to the new operating model and in line with benchmarks 
Development of a comprehensive global Finance transformation roadmap of 21 initiatives to achieve defined future state and realization of cost-saving projections by 2017

Phase 2 of FT - Implementation is currently underway.  SUPPLIER supported of the following work-streams in 2015: 
Program Management
Change Readiness Assessment and Change Management Strategy
Communications Strategy
Organization Design
Governance Model Design
Accounting Standards, Reporting & Consolidation COE 




Engagement Scope

The overall objective of FT Implementation in 2017 is continued execution of the highest priority projects, phased transition to the future state operating model and realization of year 1 FT projected benefits.  

BUYER Finance leadership is looking to engage SUPPLIER Consulting in the short term to address internal capacity and capability constraints and transition the current activities and responsibilities of SUPPLIER resources to internal BUYER resources.  

Specifically, BUYER Finance is looking for SUPPLIER to provide interim support for the following projects in 2017:
Program Management
Change Management and Communications Implementation
Organizational Design
Accounting to Reporting Globalization 

BUYER may request support for additional FT Roadmap projects in 2017 or extend support beyond proposed dates.  Any additional assistance required in 2017 will be the subject of an addendum to this Statement of Work.

Approach, Key Activities and Deliverables by Project

PM: Program Management
SUPPLIER will continue provide dedicated support to assist the BUYER FT Program Lead and run the Program Management Office (PMO) responsible for enabling and monitoring implementation of FT projects through March 28, 2017.  SUPPLIER will transition responsibilities to an internal BUYER resource identified / hired to manage on-going execution, providing the internal BUYER resource is available full-time effective March 17, 2017. 

Interim key activities include:
Program / project planning
Integrates individual project work-plan into the master plan
Clearly defines dependencies within FT projects and with outside FT initiatives
Coordinates and tracks resource allocation across the FT program 
Refreshes overall program benefit projections
Progress Tracking & Status Reporting
Tracks milestones/ progress against master plan and communicate time-slippage and overall project impact based on individual project updates
Creates monthly ‘Situation Summary’ and ‘Realization Indicators’ for Program Sponsors and GSF
Issue management / resolution
Tracks program / project issues 
Coordinates appropriate and timely resolution, escalating where necessary
Dependencies management 
Coordinates Cross Project Governance Team meetings to facilitate interdependencies discussion
Communicates dependencies with other projects within FT or with other initiatives 
Knowledge Sharing
Provides “Best practices” and knowledge sharing across projects
Ensures utilization of consistent methodologies, approaches and tools

Key Deliverables include:
Master project plan covering all on-going FT projects
Aggregate resource tracking tool
Issues tracking and resolution log
Monthly status reports, Situation Summaries and Realization Indicators reports




CC - Change and Communications
SUPPLIER will continue to provide dedicated support and partner with BUYER Change and Communications resources on the execution of Change and Communications activities through February 29, 2017.  SUPPLIER will transition responsibilities to the internal BUYER change manager hired to manage on-going execution, providing the internal BUYER resource is available full-time effective February 18, 2017. 

Interim key activities will include:
Support the development of a Change and Communications Plan and Roadmap: incorporate stakeholder information to create a change and communication plan. The plan is designed to create awareness and education about the changes ahead and the impacts to the organization
Develop 2017 communication plan based on the stakeholder analysis information. 
Determine the media to be used.  
Identify the communication preparer and communicator. 
Confirm who is responsible for providing project information.
Confirm the timing and distribution of communications 
Monitor plan across FT workstreams to identify impacts to the Finance community
Develop and facilitate communication review and approval process
Support the development of Communication Materials: provide project information describing the change imperative, nature of change, potential effect of the change and anticipated timing
Ensure that the purpose and approach of each communication is clearly linked to the communication plan
Develop messages for communications
Educate individuals responsible for delivering the communications
Deliver communications and collect feedback
Evaluate feedback
Update communications plan

SUPPLIER will support the development of such key deliverables as:
Communication Plan 
Change Management Strategy
FT Communications Materials for executive meetings, cascades, etc.

OD – Organization Design
SUPPLIER will continue to participate on the FT Organization Design Core Team and support the development of the detailed Finance organization design and transition planning through May 2, 2017.  

Key activities will include:
Assist as requested in Conducting Short-term Detailed Organization Design: Country and Region (ex-US) which can include
Partnering with Division / Geographic Finance Leads on immediate cost savings
Meeting with International Finance Leads on country/regional models
Identifying country / regional office Finance synergies
Defining the formal structure, roles & responsibilities, reporting relationship and spans of control
Designing the job profiles required to support the new organization
Identifying required competencies for roles 
Developing workforce transition plans
Working with change and communications team to develop messaging for impacted stakeholders

SUPPLIER will support the development of such key deliverables as:
Detailed short-term organization design (countries and regions, ex-US)
Organization Structure
Job profiles
Reporting relationships
Workforce transition plans
Communications Materials

PR-05:	Accounting to Reporting Globalization (A2RG) 
SUPPLIER will provide subject matter advisory services to the BUYER FT A2RG team and assist in two workstreams: Data Stewardship and A2RG Global Blueprint through the completion of the Blueprint or May 15, 2017 (whichever comes first). 

Key activities will include:
Data Stewardship: support the A2RG team in defining governance structure and decision rights for Data Stewardship
Define “end-state” and “interim state” Data Stewardship organization structure
Develop data steward roles and competency profiles and facilitate knowledge transfer from TEAM core team
Define and communicate process standards for Data Stewardship
Define and communicate data standards for Data Stewardship
Perform transition from TEAM to newly formed Data Stewardship organization
A2RG Global Blueprint: support the development of the A2RG TEAM-aligned Global Blueprint:
End-to-end Process Maps
Roles and Responsibilities
Policies and SOPs 

SUPPLIER will support the development of such key deliverables as:	
Data Governance
Frozen period guiding principles for SAP/Legacy data elements and change request/approval process
"To-Be" and "Interim" FBM master data governance organization structure, Process flows, Standard Operating Procedures (SOP), Policy, and Service level agreements
FBM master data standards and dictionary
A2RG Global Blueprint
Process Maps
Policies and SPOs


High-Level Timeline


SUPPLIER Consulting and BUYER Team
SUPPLIER Consulting will partner with BUYER to deliver the work defined above in the scope and approach. 
SUPPLIER Team
Leadership, Support and Oversight
RESOURCE 1, a Principal who leads the Finance Strategy and Transformation service offering at SUPPLIER, will provide overall project leadership and will dedicate ~ 4 hours/week.  RESOURCE 1 will be responsible for the overall strategic direction of the engagement, help the team make decisions regarding the day to day activities of the projects, provide resources and required support and help resolve issues.  He will also attend key executive meetings and provide subject matter advice and guidance when necessary.  
RESOURCE 2, a Principal in SUPPLIER’s Organization & Change Management practice and co-author of “The Heart of Change”, will provide leadership and subject matter advice for Change Management and Communications and Organization Design and will dedicate ~4 hours/week.  RESOURCE 2 will be responsible for the strategic direction of the projects, help the team make decisions regarding the day to day activities, provide resources and required support and help resolve issues, and provide subject matter advice and guidance.  
RESOURCE 3, a Senior Manager in SUPPLIER’s Strategy and Operations practice and FT Phase 1 Core Team Member, will oversee all on-going FT projects supported by SUPPLIER and will dedicate ~1 day/week.  RESOURCE 3 will provide oversight of SUPPLIER resources and subject matter advice and will be responsible for delivery of SUPPLIER’s scope of services and quality assurance.  It will also be her responsibility to escalate issues and recommend solutions to project leadership.

Dedicated Execution Support

Program Management:
RESOURCE 4, a Senior Consultant with program management experience, will be dedicated full-time and be responsible for managing the PMO, executing the day-to-day project tasks, and producing project deliverables in accordance with the project timeline.

Change Management and Communications:
RESOURCE 5, a Senior Consultant in SUPPLIER’s Human Capital practice, will be assigned full time to Change and Communications.  She will be responsible for executing the day-to-day project tasks and supporting the development of project deliverables in accordance with the project timeline.
Organization Design
RESOURCE 6, a Manager in SUPPLIER’s Human Capital practice, will be assigned full time to OD and will be responsible for day-to-day project management, execution of key activities, supporting content / deliverable development and providing subject matter advice.

RESOURCE 7, a Consultant in SUPPLIER’s Human Capital practice, will provide full-time support to OD including execution of day-to-day project tasks and supporting the creation of project deliverables.

RESOURCE 8, an Analyst in SUPPLIER’s Human Capital practice, will provide full-time support to OD including execution of day-to-day project tasks and supporting the creation of project deliverables.

Accounting to Reporting Globalization (A2RG)
RESOURCE 9, a Manager in SUPPLIER’s Financial Management practice and former member of the A2R team, will provide support to A2RG and will be responsible for providing subject matter advice, execution of key activities, and supporting content / deliverable development.     

RESOURCE 10, a Senior Consultant in SUPPLIER’s Financial Management practice, will provide interim support to Phase I A2RG including execution of day-to-day project tasks and supporting creation of project deliverables.

BUYER Team
Leading the projects outlined in the SOW will be key resources from the BUYER Finance organization, the majority of whom have been identified as indicated below.














Timing and Pricing 
Based on our collaborative work in developing the FT implementation roadmap as well as supporting the execution of priority projects in 2017 and our understanding of BUYER’s current needs, we have structured our support to fit the specific requirements of each project.  As the projects progress, BUYER may decide to modify the end dates for selected resources and / or projects, use more or less of SUPPLIER’s resources, or may choose to add SUPPLIER support to additional FT Implementation projects.  As projects near completion, BUYER may choose may extend SUPPLIER support beyond the timeframes outlined to support transition of activities / responsibilities to internal resources.  We will offer flexibility and responsiveness in meeting BUYER’s evolving needs.  Project durations, resource allocations and level of effort for the project are based on our estimate at the time of this letter.

At negotiated BUYER Operations MSA rates, aggregate professional fees for the portfolio of projects included in this SOW are estimated at ~$1,060,000 for 2017.
Professional Fee Details by Project:



Professional Fees Summary by Project:



Expenses are estimated at 10% of total fees and will be billed in addition to fees.  We will invoice you monthly for professional fees and actual expenses.

If you have any questions about this Statement of Work, please feel free to give me a call at 111.111.1111.


The Parties have caused this Statement of Work to be executed by the signatures of their respective authorized representatives.  The Parties signatures below acknowledge understanding and acceptance of project objectives, scope, deliverables, resources and fees.  The BUYER Project Sponsor will be responsible for generating the purchase order once all parties below have signed this document.
`,
    payload: {
      deliverables: [
        {
          title: "Master project plan",
          activities: [
            "Program / project planning",
            "Integrate individual project work-plan into the master plan",
            "Define dependencies within FT projects and with outside FT initiatives",
            "Coordinate and track resource allocation across the FT program",
            "Refresh overall program benefit projections",
            "Track milestones/progress against master plan",
            "Communicate time-slippage and overall project impact based on individual project updates",
            "Create monthly ‘Situation Summary’ and ‘Realization Indicators’ for Program Sponsors and GSF",
            "Track program/project issues",
            "Coordinate appropriate and timely resolution, escalating where necessary",
            "Coordinate Cross Project Governance Team meetings to facilitate interdependencies discussion",
            "Communicate dependencies with other projects within FT or with other initiatives",
            "Provide 'Best practices' and knowledge sharing across projects",
            "Ensure utilization of consistent methodologies, approaches, and tools",
          ],
        },
        {
          title: "Communication plan and change management strategy",
          activities: [
            "Support the development of a Change and Communications Plan and Roadmap",
            "Develop 2017 communication plan based on the stakeholder analysis information",
            "Determine the media to be used",
            "Identify the communication preparer and communicator",
            "Confirm who is responsible for providing project information",
            "Confirm the timing and distribution of communications",
            "Monitor plan across FT workstreams to identify impacts to the Finance community",
            "Develop and facilitate communication review and approval process",
            "Support the development of Communication Materials",
            "Ensure that the purpose and approach of each communication is clearly linked to the communication plan",
            "Develop messages for communications",
            "Educate individuals responsible for delivering the communications",
            "Deliver communications and collect feedback",
            "Evaluate feedback",
            "Update communications plan",
          ],
        },
        {
          title: "Detailed short term Org design",
          activities: [
            "Assist as requested in Conducting Short-term Detailed Organization Design: Country and Region (ex-US)",
            "Partner with Division / Geographic Finance Leads on immediate cost savings",
            "Meet with International Finance Leads on country/regional models",
            "Identify country / regional office Finance synergies",
            "Define the formal structure, roles & responsibilities, reporting relationship, and spans of control",
            "Design job profiles required to support the new organization",
            "Identify required competencies for roles",
            "Develop workforce transition plans",
            "Work with change and communications team to develop messaging for impacted stakeholders",
          ],
        },
        {
          title: "Data governance and A2R global blueprint",
          activities: [
            "Data Stewardship: support the A2RG team in defining governance structure and decision rights for Data Stewardship",
            "Define 'end-state' and 'interim state' Data Stewardship organization structure",
            "Develop data steward roles and competency profiles and facilitate knowledge transfer from TEAM core team",
            "Define and communicate process standards for Data Stewardship",
            "Define and communicate data standards for Data Stewardship",
            "Perform transition from TEAM to newly formed Data Stewardship organization",
            "A2RG Global Blueprint: support the development of the A2RG TEAM-aligned Global Blueprint",
            "End-to-end Process Maps",
            "Roles and Responsibilities",
            "Policies and SOPs",
          ],
        },
      ],
    },
  },
  {
    text: `
Statement of Work: Financial Model Design and Implementation Project Assistance

Dear BUYER:
This Statement of Work (“SOW”), dated 30 August 2017, is made by the  SUPPLIER LLP ("we" or "SUPPLIER") and BUYER   (“BUYER ”, "you" or "Client") pursuant to the Agreement dated 28 October 2015 (the "Agreement") between SUPPLIER  and BUYER  .
Except as otherwise set forth in this SOW, this SOW incorporates by reference, and is deemed to be a part of, the Agreement. The additional terms and conditions of this SOW shall apply only to the Services covered by this SOW and not to Services covered by any other Statement of Work pursuant to the Agreement. Capitalized terms used, but not otherwise defined, in this SOW shall have the meanings in the Agreement. For the purposes of this SOW, references in the Agreement to "you", "Client", "we" or "SUPPLIER " shall be deemed to be references to those terms as the SUPPLIER are defined above.
Scope of services (“Services”)	
The primary purpose of this engagement is to assist BUYER in designing and implementing a new financial model on the S/4 Hana SAP application. This new financial model will more accurately reflects BUYER ’s business and transactions across the hydrocarbon value chain.  SUPPLIER objectives of the financial model design and implementation project include:
•Improve the transparency of information for external reporting and decision making across the business
•Simplify and reduce the number of intercompany transactions which provide minimal business benefit
•Increase the accuracy of reporting and data flow
•Minimize risk – financial, reporting, and regulatory
SUPPLIER activities for this engagement have been identified in two major work streams; 1) Finance and Accounting support, 2) Treasury Management System design and implementation.
1) Finance and Accounting support would comprise the following components as described below:
Solution Configuration
Accounting transaction processing for heavy oil production
Inventory accounting methodology
Cost of goods collection
Cost allocation changes for new financial model
Performance reporting for new system P&L business units
SAP Engagement (Communication, validation, knowledge transfer, designing Testing)
Accounting Policy Review
Other IFRS considerations; E.g., Lease accounting, Revenue Recognition
Data Object optimization
Inactive data object clean-up (elimination)
Hierarchy optimization
Segment, company, group reassignments
Rationalization of master date fields currently in use
Data definitions and usage guidelines
New data object requirements
Financial Reporting changes (re-segmentation)
Changes to financial statement segmented reporting (restatements)
Alignment with internal BUYER business unit accountability and management structures
Changes to other financial reports – E.g., MD&A, AIF, supplemental schedules, Internal/External websites (Bloomberg, Investor presentations)
Performance reporting to the Board
Process simplification
Intercompany profit eliminations
Intracompany profit eliminations
Other process changes – E.g., Expense processing, lubricant purchases, marketing performance management
Month end close optimization
System process for integration to BPC-plan
Asset Transfers
Legal entity changes
Tax elections (Corporate Tax, Land Transfer, Commodity Tax)
Tax filings
Fair Market value assessments
Asset coding reassignments
Contract changes (intercompany / External)
Transition plan for roll-out of new financial model reports (updates to investor relations model for analysts)
Analysts testing/validation, training, and communications
Messaging and communications in BUYER investor presentations
Value measurement to evaluate impact on BUYER market value
Change Management (Finance Specific)
Training
Communication
Program Management
Status, oversight, issue management, performance reporting
Risk management on project (Schedule, Cost, Functionality)

Any further phases of work will be confirmed in writing in an addendum to this statement of work prior to any out-of-scope activities being performed.
We recommend the following team structure for the scope of activities.

2) Treasury design and implementation includes;
Evaluate the current state of your Treasury function using agreed criteria based on our Treasury maturity assessment tool.
Identify and prioritize Treasury improvement opportunities to help you identify where most value could be generated based on your objectives and constraints.
Perform a high level review of your Treasury function strategy and its alignment with long term objectives, giving a specific focus of the following:
Timely visibility on cash
Netting
Accessibility to cash
Payments
Cash forecast
Foreign exchange
Notional pooling
Short term investments

We recommend the following team structure for the scope of activities for both work streams.
 

Timetable
Unless otherwise agreed, and subject to the General Terms and Conditions of the Agreement, we expect to begin the Services immediately.  

Our team
Mr. Doe will serve as Engagement Partner and lead client server on this project. He will be responsible for the overall quality of our work and confirming that our work meets BUYER ’s expectations. He will also bring his experience and understanding of BUYER to the analysis of issues and identification of opportunities. Mr. Doe will be supported by oil and gas advisory professionals as required through the project.   

Fees
The General Terms and Conditions of the Agreement address our fees and expenses.
BUYER shall pay SUPPLIER 's fees for the Services based on time spent by the relevant professionals in performing the Services, at the following hourly rates:

Rate
Partner			$495
Senior Manager		$395
Manager		$285
Consultant		$225

To provide visibility on incurred and forecasted time, weekly updates will be provided to you to confirm future activities and effort.  SUPPLIER 's fees and any applicable taxes will be invoiced based on the actual time incurred over the course of the engagement. Please indicate your agreement with the terms of this engagement by executing this SOW in the space provided below and returning it to Mr. Doe so that we may start work on this project.
You are requested to please sign the enclosed copy as a mark of your acceptance and return the same to us.
If you have any questions regarding the above, please contact Mr. Doe.
Yours sincerely,      
`,
    payload: {
      deliverables: [
        {
          title: "Finance and accounting solution configuration",
          activities: [
            "Define an inventory accounting methodology",
            "Define the future state of cost allocation for new financial model",
            "Define the future state of the accounting transaction processing",
            "Define the future state of cost of goods collection",
            "Define the future state of the performance reporting for new system P&L business units",
            "Configure future state",
          ],
        },
        {
          title: "Accounting policy review",
          activities: [
            "Analyze other IFRS considerations (e.g., lease accounting, revenue recognition)",
            "Accommodate impacts of other IFRS considerations (e.g., lease accounting, revenue recognition)",
          ],
        },
        {
          title: "Data object optimization",
          activities: [
            "Clean-up inactive data object (elimination)",
            "Define segment, company, group reassignments",
            "Optimize account hierarchy",
            "Rationalize master date fields currently in use",
            "Define data and usage guidelines",
            "Identify new data object requirements",
          ],
        },
        {
          title: "Financial reporting changes (re-segmentation)",
          activities: [
            "Identify changes to financial statement segmented reporting (restatements)",
            "Align with internal business unit accountability and management structures",
            "Identify changes to other financial reports (e.g., MD&A, supplemental schedules, internal/external websites (Bloomberg, investor presentations)",
            "Identify changes to the performance reporting to the board",
          ],
        },
        {
          title: "Process simplification",
          activities: [
            "Optimize intercompany receivables eliminations",
            "Optimize intercompany payable eliminations",
            "Optimize intercompany cost of sale eliminations",
            "Optimize intracompany profit/loss eliminations",
            "Other process changes (e.g., expense processing, lubricant purchases, marketing performance management)",
            "Optimize month-end close optimization",
            "Define the future state of system process for integration to BPC-plan",
          ],
        },
        {
          title: "Asset transfers",
          activities: [
            "Identify legal entity changes",
            "Identify Tax elections (Corporate Tax, Land Transfer, Commodity Tax) changes",
            "Identify Tax filings changes",
            "Identify Fair Market value assessments changes",
            "Identify Asset coding reassignments changes",
            "Identify Contract changes (intercompany / External) changes",
          ],
        },
        {
          title: "Transition plan for roll-out of new financial model reports",
          activities: [
            "Validate effectiveness and accuracy of new financial model reports",
            "Train analysts on new financial model reports generation",
            "Communicate new financial model reports to stakeholders",
            "Validate the transfer of the new financial model in the investor presentations",
            "Evaluate the impacts of value measurement on the market value",
          ],
        },
        {
          title: "Change management",
          activities: [
            "Communicate to the finance organization the new financial model",
            "Train the finance organization on the delta from old to new financial model",
          ],
        },
        {
          title: "Program management",
          activities: [
            "Status, oversight, issue management, performance reporting",
            "Produce a weekly status report",
            "Communicate/escalate any risk or issue",
            "Monitor budget and timeline",
            "Communicate/escalate any budget or timeline anomalies",
          ],
        },
        {
          title: "Treasury design",
          activities: [
            "Evaluate the current state of the treasury function using agreed criteria based on latest treasury maturity assessment tool.",
            "Define objectives",
            "Define constraints",
            "Identify treasury improvement opportunities.",
            "Identify where most value could be generated based on your objectives and constraints.",
            "List and prioritize treasury improvement opportunities.",
            "Perform a high-level review of your treasury function strategy and its alignment with long-term objectives",
            "Analyze timely visibility on cash",
            "Analyze netting",
            "Analyze accessibility to cash",
            "Analyze payments",
            "Analyze Cash forecast",
            "Analyze foreign exchange",
            "Analyze notional pooling",
            "Analyze short-term investments",
          ],
        },
      ],
    },
  },
  {
    text: `
The BUYER 
Attention: Mr. Doe
Address
Montreal, November 8, 2018
Statement of Work – SYSTEM Business Process Documentation

Dear Mr Doe:

Thank you for choosing the Canadian firm of SUPPLIER (“we” or “SUPPLIER”) to perform professional 
services (the “Services”) for The BUYER  (“you” or “Client”). We appreciate the opportunity to assist 
you and look forward to working with you on the SYSTEM Business Process Documentation. All the Services will be subject to the terms and conditions of this Statement of Work and the attached General Terms and Conditions dated June 18, 2018 (together, this “Agreement”). Except as otherwise set forth in this SOW, this SOW incorporates by reference. The additional terms and conditions of this SOW shall apply only to the advisory Services covered by this SOW and not to Services covered by any other Statement of Work pursuant to the Agreement. Capitalized terms used, but not otherwise defined, in this SOW shall have the meanings in the Agreement. For the purposes of this SOW, references in the Agreement to "you", "Client", "we" or "SUPPLIER" shall be deemed to be references to those terms as the SUPPLIER are defined above.

CONTEXT & OBJECTIVES

BUYER is in the process of implementing SYSTEM, BUYER’s SAP ERP system, scheduled to go live on April 1st, 2019. As part of SYSTEM, BUYER has identified the requirement to develop robust business process documentation that will help drive change across the organization and is a SUPPLIER success factor for SYSTEM training. Some high-level business process documentation was delivered but is not sufficient to meet training needs. As such, additional efforts are required to successfully support the launch of SYSTEM. BUYER is now looking for a business partner to document as-is business processes in time to successfully prepare for SYSTEM Go-Live. SUPPLIER was selected by BUYER for its ability to rapidly and thoroughly document processes and ensure the SUPPLIER are aligned with both current way of working and training requirements.

PROJECT SCOPE

Phase 1 – Project Planning & Mobilization (Week 1)

Key Activities

Prioritize processes for mapping based on complexity, risk level and training requirements
Obtain existing process documentation and identify gaps – update templates as required
Develop high-level schedules and milestones
Estimate resource requirements and plan for delivery across the phases 
Develop stakeholder map and engagement strategy for business mapping
Facilitate workshop to share knowledge in process mapping projects performed elsewhere

Outputs

Scope statement detailing agreed process prioritization
Project schedule and milestones
SUPPLIER Resource plan
Kick-off meeting & workshop on process mapping knowledge sharing 

Phase 2 – Process Mapping & Documentation (Week 2-9)

Key Activities

Plan iteration and process backlog
Draft process maps based on current BUYER’s documentation and SUPPLIER Process Depot
Conduct process workshops: work with BUYER’s dedicated resources to understand and map each process, incorporating:
Normal business operation scenarios 
Personalization required to respond to the specific context of BUYER’s business units (assumption is less than 10% personalisation required)
Document processes to BUYER’s requirements
Validate process maps with process owners and SUPPLIER stakeholders
Update documents based on feedback from process owners
Review of documentation by SUPPLIER subject matter specialists to identify any improvement opportunities

Outputs

Discovery map
Detailed process documentation, as per BUYER’s requirements: 
Process diagrams
Activity sheet detailing information about a process map and its activities
Summary of findings for presentation to BUYER’s management
Weekly project status report & dashboard, including financials

Phase 3 – Finalization & Close-out (Week 9-10)

Key Activities

Complete process documentation for outstanding processes, including validation with Business/Process Owners
Conduct lessons learned analysis to identify issues that should be considered in further process mapping initiatives
Complete final report for distribution to BUYER’s management, including:
Summary of findings
Recommendations to improve existing processes 

Outputs

Detailed documentation of final remaining processes
Final report with findings and recommendations 

An example of the output documentation to be developed is contained in Appendix 1 of this statement of work document.

TIMELINE

Unless otherwise agreed, and subject to the General Terms and Conditions of the Agreement, we expect to perform the Services over 10 weeks, during the period from November 12, 2018 to January 31, 2019 for the first prioritized processes. The following project plan reflects how we intend to deliver the Services to BUYER during the first 10 weeks.

CONTACTS

You have identified Mr. Doe as your contact with whom we should communicate about these 
Services. Your contact at SUPPLIER for these Services daily will be Ms. UHJ. The partner in 
charge of this mandate will be Ms. XUZ.

SPECIFIC ADDITIONAL TERMS & CONDITIONS

The Services are advisory in nature. SUPPLIER will not render an assurance report or opinion under the Agreement, nor will the Services constitute an audit, review, examination, or other form of attestation as those terms are defined by the American Institute of Certified Public Accountants or the Chartered Professional Accountants of Canada. None of the Services or any Reports will constitute any legal opinion or legal advice. We will not conduct a review to detect fraud or illegal acts.

Notwithstanding anything to the contrary in the Agreement or this SOW, we do not assume any responsibility for any third-party products, programs or services, their performance or compliance with your specifications or otherwise. 

We will base any comments or recommendations as to the functional or technical capabilities of any products in use or being considered by you solely on information provided by your vendors, directly or through you. We are not responsible for the completeness or accuracy of any such information or for confirming any of it.

You shall not, while we are performing the Services here under and for a period of 12 months after the SUPPLIER are completed, solicit for employment, or hire, any SUPPLIER personnel involved in the performance of the Services, provided, that you may generally advertise available positions and hire SUPPLIER personnel who either respond to such advertisements or who come to you on their own initiative without direct or indirect encouragement from 
you.

PROFESSIONAL FEES

We estimate the efforts to represent 1,800 hours. Our initial fee estimates range between CAD$ 285,000 and 345,000, excluding applicable taxes. At project start and according to the documentation provided, estimates of hours per process per resource will be refined. To demonstrate our appreciation and commitment to you, time spent by our Subject Matter Experts will be at no charge. It represents an investment by SUPPLIER of about CAD$ 20,000 to 30,000.

BUYER shall pay SUPPLIER's fees for the Services based on time spent by the relevant professionals in performing the Services, at the following hourly rates:
Role Hourly Rate (CAD$/h) Total Weekly Hours
Engagement Partner 350 4h
Manager 225 40h
Senior / Consultant 150 3 resources at 40h
1 resource at 20h

We propose to keep the current rates for the first 140 processes.

Beyond this first wave, based on experience, we would estimate the numbers of hours to be done per process and offer a discount on the rate for the next processes according to the complexity level (description to be agreed upon between BUYER and SUPPLIER). SUPPLIER and BUYER will agree on required efforts for each type of processes.
Processes 0-140 141-200 201+
Complex
Processes with multiple exceptions and / or differences 
between multiple brands
Current rate -5% -10%
Normal
Processes with exceptions or differences between 
different brands
Current rate -5% -10%
Simple
Process with little to no exception and similar on all 
brands
Current rate -8% -15%

The rates are valid until December 31st, 2019 as required by the SYSTEM project.

Our effort estimates assume that BUYER will provide on a timely basis the facilities and resources needed for execution of the project. More specifically, we estimate BUYER resources involvement per 
process to represent:
2-3h to attend workshop (per stakeholder & Business/Process Owner)
2-3h to answer follow-up questions and review work products (per stakeholder & Business/Process Owner)
1-2h for approvals and sign-off (Business/Process Owner)

Budget will be reviewed on a weekly basis via the project status dashboard and any changes will be 
communicated and approved in advance. In addition, BUYER shall reimburse SUPPLIER for pre-approved direct and allocated expenses (such as travel) incurred in connection with the performance of the Services.

SUPPLIER's fees, expenses and any applicable taxes will be invoiced monthly as time and expenses are incurred. 

Payment of SUPPLIER's invoices is due upon receipt. Interest on overdue accounts accrues at 12% per annum starting 60 days following the date of our invoice. SUPPLIER may suspend performance of the Services in the event you fail to pay our invoice.

Please sign this letter in the space provided below to indicate your agreement with these arrangements and return it to us at your earliest convenience. If you have any questions about any of these materials, please do not hesitate to contact SUPPLIER so that we can address any issues you identify before 
we begin to provide any Services.

APPENDIX 1

Example Output Documentation

For each of the processes that are identified for documentation, BUYER expects SUPPLIER to develop the following outputs: 
1- Discovery Map: The Discovery Map view is a high-level, summarized view of a process map. This view 
allows the user to see the major milestones involved in the process and the activities that take place under each milestone. The Discovery Map view is useful for viewing the activities that must take place at each stage of the process, or for viewing a summary of the activities throughout the Process. This view is most often used at the beginning of the process map building exercise and the list of activities in the process can be more easily generated by brainstorming with the stakeholders.

2- Process Diagram: The ‘Process Diagram’ view is where process maps are built. This view displays involved actors and systems, as well as the sequence of activities, decisions, and linked processes. Milestones are listed across the top of the view and segment the process map into stages. On the left, the view displays ‘Swimlanes’ (which are the participants from the ‘Discovery Map’ view). A swimlane 
represents a party responsible for conducting the activities within the swimlane.

3- Documentation: The ‘Documentation view’ presents the detailed information about a process map and its activities. This includes information types, from the relevant parties involved in the process (Participants, Business Owners, Subject Matter Experts, etc.) to Process details (Inputs, Outputs, Risk, Cycle Time, etc.), and Process documentation.
`,
    payload: {
      deliverables: [
        {
          title: "Scope statement detailing agreed process prioritization ",
          activities: [
            "Prioritize processes for mapping based on complexity, risk level and training requirements",
            "Obtain existing process documentation and identify gaps – update templates as required ",
            "Identify gaps between current and future state",
            "Update templates as required ",
          ],
        },
        {
          title: "Project schedule and milestones",
          activities: [
            "Develop high-level schedules and milestones",
            "Weekly project status report & dashboard, including financials ",
          ],
        },
        {
          title: "Resource plan",
          activities: [
            "Estimate resource requirements and plan for delivery across the phases",
            "Develop stakeholder map and engagement strategy for business mapping",
          ],
        },
        {
          title:
            "Kick-off meeting & workshop on process mapping knowledge sharing",
          activities: [
            "Facilitate workshop to share knowledge in process mapping projects performed elsewhere",
          ],
        },
        {
          title: "Discovery map",
          activities: [
            "Plan iteration and process backlog",
            "Draft process maps based on current BUYER’s documentation and SUPPLIER Process benchmark",
            "Conduct process workshops for discovery map",
            "Validate process maps with process owners and SUPPLIER stakeholders",
          ],
        },
        {
          title: "Detailed process documentation – process diagrams",
          activities: [
            "Conduct process workshops for process diagrams",
            "Document process diagrams",
            "Validate process diagrams with process owners and SUPPLIER stakeholders",
            "Update documents based on feedback from process owners",
            "Review of documentation by SUPPLIER subject matter specialists to identify any improvement opportunities",
          ],
        },
        {
          title: "Detailed process documentation – activity sheets",
          activities: [
            "Conduct process workshops for activity sheets",
            "Document activity sheets",
            "Validate activity sheets with process owners and SUPPLIER stakeholders",
            "Update documents based on feedback from process owners",
            "Review of documentation by SUPPLIER subject matter specialists to identify any improvement opportunities",
          ],
        },
        {
          title: "Final report",
          activities: [
            "List work performed and scope covered",
            "Summarize of findings",
            "Provide new discovery map",
            "Provide new process diagrams",
            "Provide new activity sheets",
            "Recommend areas of improvements",
            "Conduct lessons learned analysis to identify issues that should be considered in further process mapping initiatives",
          ],
        },
      ],
    },
  },
  {
    text: `
STATEMENT OF WORK FOR AUTOMATION SERVICES


Engagement Overview.

This SOW describes the scope of Proof-of-Concept (POC) services SUPPLIER will provide to BUYER.

2.	Description of Services/Vendor Responsibilities.

The SUPPLIER team will provide the Services set forth in this SOW; however, no person in the Vendor team has any responsibility for making any management decisions in relation to Customer’s business.  Responsibility for making management decisions remains solely with Customer and Customer’s management.

Vendor will provide project management, business analysis and solution configuration support of two third-party solutions, Blue Prism Robotics (“Robotics”), and Mobile Cloud Digital Portal Service (“Digital Portal”), in Customer’s location(s) for the in-scope PoC as described below. Vendor will leverage experience and knowledge of client from previous engagements and SUPPLIER’s pre-existing Digital Portal and Robotics integration accelerators. Customer has approved the use of Robotics and Mobile Cloud as Third-Party Technology and, as applicable, subcontractors under this SOW and in the POC.

The project has three parts as described below and this phase is focused on expediting Part 1 POC on a schedule and in a way that enables possible December 2015 deployment to production (i.e., minimize application stubbing, production code ready to the extent possible). Part 2 will be handled as a PoC without December timeline pressure. Part 3 is identified as a future project and not in scope for this SOW.
Part 1 (Robotics-only). BUYER retailer strategic partner (“Retailer”) will take customer credit application, make information from the credit application and their CIF available to POC. POC will take this customer information, deliver it to credit card decision engine and return answer to originating system
Part 2 (Robotics and Digital Portal). Add Port-lette (i.e., little portal) application to serve as customer interface into credit process (where credit application is completed and where customer will be advised of credit decision
Part 3 (Robotics-only). Take information on accepted applications and data enter them into SYSTEM to initiate issuance workflow.

Vendor will work jointly with the Customer’s XXX team across the following areas:

PoC Central Engagement Management:

Vendor personnel will be managed by a central SUPPLIER engagement team. This team will:
Co-ordinate planning, training, resourcing, contracting and reporting activity with the Customer. Detailed procedures will be agreed with Customer at the start of this engagement
Manage activities 
Provide overall program management of the PoC 
Provide escalation and issue resolution support where required 

A regular stakeholder alignment checkpoint and governance framework will be put in place to help create a shared vision of success. This will include:
Progress report – Milestones completed, tracking against plan
Budget report – tracking against plan
Risks and issues 
Requests and escalation management 
Significant next steps

Where significant fluctuations in the plan are identified, the Customer and Vendor teams will jointly re-plan and re-prioritize in line with the budgeted fees of this SOW or prepare a mutually agreeable Change Order to accommodate the extension of Services (as defined below).

PoC Execution: 

Following an initial mobilization, the PoC is time-boxed to 6 weeks (See also Section 7). 

The PoC is comprised of the initial setup, planning and configuration activities (weeks 1-2) followed by 3 sequential ‘agile’ configuration sprints (weeks 3-5).  Each sprint is one week in duration for development and unit testing of a functional product available for review and to serve as the starting point for the next sprint. PoC wrap-up and evaluation will happen at the end of the PoC (week 6).

The PoC has four work streams:



Limitations on PoC scope: 

A summary of the out of scope items is highlighted below:
No major changes to Digital Portal will be performed and PoC scope will be limited to meet Digital Portal’s current functionality. 
The PoC will only be delivered on iOS iPad and Web, to minimize UI change costs. 
Scenarios not contained in the agreed list of user stories
IT changes to existing legacy applications, other than connectivity for either BUYER or its retail partner.
Input from third party suppliers
Deploying PoC into production
Proving of POC route-to-production
Neither Vendor nor its subcontractors will access or connect to Customer’s or Retailer’s production systems
Inclusion of paper based correspondence or documentation
Change strategy and programs
Side-by-side technological evaluation of different solutions


3.	Deliverables; Background Technology; Third Party Technology; Open Source.

PoC Deliverables:

Vendor activities and reports are outlined by role in the tables (collectively the “Services”). 



PoC Third-Party Technology and SUPPLIER Code Assets:

The PoC includes two Third Party Technologies, namely Blue Prism Robotics and Mobile Cloud Digital Portal Service.  Each PoC will utilize Blue Prism’s direct evaluation license between Customer and Blue Prism. Mobile Cloud’s Digital Portal service will be contracted by SUPPLIER for use in the PoC. 

The Deliverables under this SOW are solely for use in connection with the PoC under this SOW.  To use the Deliverables in production after the PoC, Customer would have to obtain licenses to the required third party software products and services including to any Third Party Technology.  

Customer and Vendor agree that Customer’s right to use any Third Party Technology provided by Vendor as part of the PoC is limited to the period of the PoC under this SOW.  Vendor and its licensors retain all IP Rights in the Third Party Technology and SUPPLIER code assets as well as any modifications to the Third Party Technology or SUPPLIER code assets.  

For greater clarity, Customer will need to determine whether the Third Party Technology used by Vendor in the PoC is suitable for any production systems that Customer may elect to implement; use of the particular Third Party Technology employed in the PoC is not a recommendation by Vendor of any such products for Customer’s use.


Open Source: There is No Open Source Code in the PoC.


4.	Testing and Acceptance Procedures; Acceptance Period.  In order to complete the PoC in the time-boxed schedule, all testing and acceptance activities will occur on a weekly basis during the time-boxed Configuration Sprints.  


5.	Service Location:  Supplier will provide the Services at Customers locations in XXX as well as from SUPPLIER locations in New York, NY, Boston, MA, London, UK and EduServ data center in England, UK.


6.	Engagement Managers.

The Parties’ respective engagement managers for this SOW are as follows:




7.	SOW Term, Timetable and Milestones (If Any).

Project Commencement Date:  SOW Effective Date
Estimated Project Completion Date:  TBD

	PoC Timetable

Following an initial mobilization, each PoC is time-boxed to 6 weeks. PoC is anticipated to be complete by TBD.


 The Digital Portal service will be available for up to four weeks following completion of these activities, to support any further demonstrations or activities that may be agreed to be required.


8.	Charges.

This SOW is offered on a time and expense basis as described below. 

Estimated cost worksheet:


The breakdown of this fee is highlighted below.  Fees do not include country applicable taxes. A notice period of 30 days is required if any vendor resources need to stand-down for a prolonged period of time or to cease activities altogether.


Applicable Professional Services Rates

The SOW is for process and automation practitioners. If Vendor resources are needed from other countries, local rates will added at comparable discounts. 



Once a Vendor resource has been allocated as full time on the engagement, they will be billable to the Customer full-time, averaging 40 hours per week in US/Canada and 35 hours per week for UK. If an engagement resource is expected to exceed full-time billable work, Vendor will notify Customer in a timely fashion and obtain Customer’s commitment through email for additional billable work. Vendor resources specifically designated as part-time are not subject to full-time billing requirement. 


Estimated PoC SUPPLIER Professional Fees

Resource hours are based on a current set of assumptions developed in discussion between the Customer and Vendor in July 2015.  The parties shall review the allocated hours early in the engagement, refining where necessary. 




PoC Third-party Environment / Support Costs:

Additional Environment and Support costs have been outlined below totaling CA$61,224. Exchange rates shown below are indicative and are provided for budgetary purposes only.  Vendor may subcontract portions of the Services to the U.K. firm of SUPPLIER (“SUPPLIER UK”) and in turn the SUPPLIER UK firm is authorized to subcontract to third-party vendors as an intermediary for Vendor.




Travel and Out-of-Pocket Expenses.

Travel and out-of-pocket expenses will be charged as a pass through expense. Both parties agree to review the initial actual travel expenses to confirm that this budget is realistic. Budget should plan for significant international travel.


Invoicing:

The invoiced amounts will be based on local currency rates, unless otherwise noted. Actual exchange rates will be converted to the currency of invoicing at the foreign exchange rate, as listed in The Wall Street Journal, applicable on the date of invoicing. Any foreign, VAT or special tax implications that are a result of using non-Canadian based SUPPLIER personnel will be reflected and payable on invoices.

All invoices will be submitted to the Customer Engagement Manager outlined in Section 6 (Engagement Managers) of this SOW above.


9.	Other Specifications.

General Customer Responsibilities

Customer will provide reasonable and timely access to the appropriate personnel for discussions and the exchange of information, and encourage stakeholder engagement and meeting participation
Customer will provide timely management decision support
Customer is responsible for legal and compliance issues related to Customer’s use of Deliverables provided to Customer by Service Provider under this SOW
Customer will identify resource(s) responsible for scheduling meetings with stakeholders and disseminating initial communications to all key constituents
Customer engagement manager (or delegate) will be available throughout the duration of the project to assist the vendor team in addressing issues that may arise that are not explicitly identified in this SOW
Customer will provide Vendor with infrastructure necessary to complete the assignment
Customer is responsible to on-board Vendor resources, providing timely access to Customer systems, documentation and resources
Dates in this SOW are subject to change based on how quickly Vendor resources gain access to required systems, documentation, stakeholders and resources
Vendor will rely on Customer resources to support Vendor in identifying stakeholder availability, assisting in scheduling meetings with stakeholders and fulfilling requests for Customer data or materials necessary to complete project tasks
Customer will make Vendor aware of any internal governance and sign-off processes relevant to this project, such that Vendor can work within these frameworks

Customer’s Responsibilities for PoC

The following roles will be provided by Customer for the PoC:
Customer PoC PM / Scrum Master will be available on a Part-time basis and will be able to handle escalations as required. 
Customer Product Owner will be authorized to define, prioritize and accept user stories / features / processes, and will be accountable for acceptance of sprint outputs and agreement of the Minimum Viable Product (outlined below) 
Customer will provide access to Technical SMEs as required for setup, access, operational and acceptance aspects of the PoC
Customer will provide access to Business / Process SMEs to facilitate an understanding of / access to systems, process documentation. SMEs will also support the product owner in specific activities (including UAT)
The Vendor team will be dependent on the validation of an agreed plan with the Customer team for the timing and key milestone dates of the PoC. Any changes in scope or timeframe should be discussed in advance with the Engagement Lead and Engagement Partner as part of a regular formal quality and governance forum, with changes to services or required fee extensions captured accordingly in a Change Order to be agreed by all parties. 
For the avoidance of doubt Vendor shall have no responsibility whatsoever for the quality and reliability of Customer’s permanent and contract staff, all of whom shall operate under the direction and control of Customer. 

PoC Resourcing:

Customer will provide to Vendor all data, information and resources reasonably required by Vendor to perform the Services described in this SOW  
Customer will supply the support necessary to setup inbound/outbound connectivity between the Digital Portal and Customer Business Area domains
Customer will ensure key stakeholders and resources are available to provide and validate designs, deployment plans, attend workshops and achieve sign-offs

PoC Delivery:

Customer will provide a physical location in which the joint project team, including Vendor team members will be located, and will provide Vendor team members with reasonable access to relevant systems, IT tools and shared knowledge databases
The POC will be built and demonstrated on existing Customer test environments, using non-confidential dummy data, and test Digital Portal environments
Opportunities for future development (which cannot be achieved within POC timelines) will be proactively identified and documented as part of the proof of concept close out report
Any scheduled downtime for Customer’s systems will be communicated as early as possible to enable the development team to plan their activities effectively

Publicity:

Customer grants SUPPLIER permission to publish a pre-agreed statement that Vendor is helping Customer with their digital strategy and robotics efforts.
Customer agrees to work with Vendor in good faith to agree on a further publicity statement and reference, subject to and following a successful proof of concept outcome and live implementation.      
    `,
    payload: {
      deliverables: [
        {
          title: "Project management",
          activities: [
            " Agree on detailed procedures with customer at the start of this engagement ",
            "Co-ordinate planning, training, resourcing, contracting and reporting activity with the customer",
            " Manage activities",
            "Provide overall program management of the PoC",
            "Provide escalation and issue resolution support where required",
            "Provide progress reports including milestones and deliverables tracked against plan",
            "Provide budget reports tracked against plan",
            "Identify and report risks and issues",
            "Navigate requests and escalation management ",
            "Forecast significant next steps",
          ],
        },
        {
          title: "Initial planning",
          activities: [
            "Define POC objectives",
            "Identify POC success criteria",
            "Identify POC architecture",
            "Identify POC roadmap",
            "Identify POC strategic alignment",
            "Identify POC business case",
          ],
        },
        {
          title: "Configuration sprints",
          activities: [
            "Set-up the environments",
            "Set-up hardware",
            "Set-up virtual machines",
            "Set-up network access",
            "Set-up user accounts",
            "Set-up the governance",
            "Set-up the other IT infrastructure and security ",
            "Create detailed user stories",
          ],
        },
        {
          title: "Unit testing of a functional product",
          activities: [
            "Implement the software robotic processes",
            "Configure the digital portal to meet the aforementioned user stories",
            "Create an overall product backlog",
            "Support the alignment and effective implementation of standard user journeys against customer business area systems",
          ],
        },
        {
          title: "PoC evaluation",
          activities: [
            "Assess if PoC meets objectives",
            "Assess if PoC meets acceptance criteria",
            "Document debrief of PoC results",
            "Define the route-to-production for PoC functionality",
          ],
        },
      ],
    },
  },
  {
    text: `
      Statement of work – Cybersecurity Assessment
Dear Mr. Doe,

This Statement of Work, dated August 22, 2018 (this “SOW”), together with its attachment(s) (collectively, the "Agreement") confirms the terms and conditions on which the Canadian firm of SUPPLIER (“we” or "SUPPLIER") has been engaged by BUYER (“you”, “BUYER” or the "Client") to provide certain professional services (the "Services").

This Agreement includes the General Terms and Conditions attached hereto, which are an integral part of this SOW and which will apply to the provision by SUPPLIER of the Services. Capitalized terms used, but not otherwise defined, in this SOW shall have the meanings in the Agreement. For the purposes of this SOW, references in the Agreement to "you", "Client", "we" or "SUPPLIER" shall be deemed to be references to those terms as they are defined above.

Context

As an extension of a cybersecurity assessment exercise performed by BUYER, a benchmark maturity analysis and an industry focused threat risk assessment report have been requested by BUYER with a focus on enhancing BUYER’s cybersecurity posture and position to mitigate current and expected cyber- threats.  BUYER has also requested that SUPPLIER analyze their existing risk management methodology to provide recommendations and cybersecurity assurance against their existing methodologies.

Summary

SUPPLIER will provide BUYER with resources to form a core delivery team that will work with BUYER counterparts to complete the planned project phases outlined below.

BUYER shall retain ownership of documents and deliverables produced during the project.
Scope of services

To meet its objective, SUPPLIER will provide BUYER with the following services set forth in this SOW:

Collect information on the cybersecurity program through review of existing documentation, interviews (if required), and observation of processes and technology.
Collect business-related information, focused on the drivers for cybersecurity and alignment of cybersecurity to business initiatives through business and executive team interviews.
Conduct a benchmark analysis between existing internal assessments and best industry practices.
Augmented benchmarking against competitors by reaching out to other SUPPLIER clients and requesting live feedback through questionnaires.
An industry focused threat risk assessment report to assist in identifying prioritized risks for BUYER’s risk universe.
Summary report of findings / recommendations for the board.
Identify and prioritize improvement opportunities to address key gaps in the program.
Provide roadmap recommendations which include prioritized improvement initiatives.
Review the existing risk management methodology to identify gaps in controls against the CIS framework.
Provide cybersecurity assurance (both negative and positive) of BUYER’s risk methodology
Provide recommendations for areas of improvement of the risk methodology and log the key risks.

We will provide you with periodic progress updates, at your request, and meet with you at the end of the project to review our results.

Engagement Methodology

The engagement will be performed using a phased approach as described below.

Phase 1: Project initiation
The purpose of Phase 1 is to identify business and IT objectives and key stakeholders, and schedule interviews with subject matter experts.

Key activities:
Create project kick-off deck
Identify interviewees and establish interview schedules if necessary
Request and collect relevant documentation including security assessments, governance structure, policies, standards, etc.
Conduct kick-off meeting to review objectives, refine approach and set project milestones

Outputs:
Project kick-off deck

Phase 2: Benchmark analysis
The purpose of Phase 2 is to perform a benchmark analysis to determine where BUYER aligns compared to current best practices and its competitors in the industry.

Key activities:
Conduct stakeholder interviews to understand and evaluate BUYER’s current profile based on CIS Framework
Synthesize results from interviews and document analysis to develop initial observations
Perform a mapping between the current state assessment that was performed internally and SUPPLIER’s Cybersecurity maturity framework
Create and distribute maturity assessment questionnaires to industry competitors 
Summarize the completed current state assessment and identify gaps against best practices and benchmark against industry competitors

Outputs:
Benchmark analysis document: Best practices and industry
Completed questionnaires with collected answers

Phase 3: Threat risk assessment report
The goal of Phase 3 is to support BUYER in building and operating a business focused, requirements driven, threat intelligence program by identifying cybersecurity threats. This will help mitigate challenges and risks often encountered and help accelerate the integration of actionable intelligence.

KEY activities:
Analyze BUYER’s cyber threat landscape and associated risks (BUYER and industry specific)
Compile a summary cyber threat risk report focused on identified Key threats.
Map identified risks against BUYER’s threat landscape

Outputs:
Summary threat risk assessment report

Phase 4: Cyber risk management methodology review and recommendations
The objective of this phase is to review the existing risk management methodology at BUYER and provide recommendations based on our observations.

KEY activities:
Review risk management methodology documentation and processes
Perform gap assessment against industry to identify both negative and positive assurance
Assess methodology against CIS framework to determine if any controls are missing
Identify any risks in a risk log
Provide recommendations on methodology

Outputs:
Risk management methodology report

Phase 5: Finalize and delivery
The objective of the 5th and final phase is to provide a board level summary report on current state and identified risks, and any recommendations for prioritization on the existing cybersecurity roadmap.

KEY activities:
Create and provide an executive summary report which contains the overall maturity assessment and Key cyber threat risks to consider.
Review existing cybersecurity roadmap and identified cyber threat risks to provide roadmap and risk universe recommendations for prioritization
Document restitution, sign-off and approvals to move versions from draft to final.

Outputs:
Executive summary report for BUYER’s leadership team
Roadmap and risk universe prioritization recommendations

Engagement Deliverables

At the end of each phase, we will provide BUYER with the draft deliverables for review and sign-off. The following section contains the list of expected documents:

Benchmark document
A document that illustrates BUYER’s position compared to best practices that also will include a benchmark with industry competitors. This document will also include the prioritized initiatives to help achieve BUYER’s desired future-state in terms of cybersecurity.

Threat risk assessment report
A detailed report on targeted threat intelligence, to identify and define the cyber threat landscape and associated risks associated to BUYER and industry, and provide a mapping between cyber threat risks and BUYER’s risk universe environment.

Risk management methodology report
A report to identify BUYER’s risk methodology posture, propose recommendations, and identify both positive and negative assurance for areas of improvement.

Roadmap & risk universe recommendations
A report that provides recommendations against the existing roadmap and strategy including a gap analysis between the threat risk assessment and BUYER’s existing cyber threat risk universe in order to assist in prioritization of the initiatives to help BUYER achieve their desired future-state by an effective risk based approach.

Executive summary
A document intended for the board with a high-level executive summary of the maturity assessment benchmarking, recommendations, and BUYER’s risk universe summary.

Assumptions

BUYER shall assign a qualified person to oversee the Services. SUPPLIER will provide the Services, and BUYER is responsible for giving directions on requirements of Services and whether the Services are appropriate for BUYER’s purposes.
We assume that BUYER’s Cybersecurity assessment is complete and does not require further assessment work to be able to carry out the maturity mappings and benchmarking.
We assume that BUYER will make available to SUPPLIER all necessary documentation required to effectively complete the benchmarking and maturity mappings.
We assume that any additional assessment work that may be required on BUYER’s current state is out of scope and will require a change request.
BUYER shall provide (or require others to provide) SUPPLIER with information and assistance (including access to records, systems, premises, people, and including such items that are specified in the Statement of Work) as reasonably required to perform the Services.
BUYER will exercise its powers to ensure cooperation and timely provision of relevant information from its stakeholders.
BUYER shall promptly inform SUPPLIER of any change to its business or personnel, or any change on scope of project, or BUYER’s ability to perform its obligations under the written agreement.
Your specific obligations

You will not, and you will not permit others to, quote or refer to the Reports, any portion, summary or abstract thereof, or to SUPPLIER or any other SUPPLIER Firm, in any document filed or distributed in connection with (i) a purchase or sale of securities, or (ii) periodic or continuous reporting obligations under any applicable securities laws. You will not contend that any provisions of any applicable securities laws could invalidate any provision of this Agreement.


Specific additional terms and conditions

Notwithstanding anything to the contrary in the Agreement or this SOW, we do not assume any responsibility for any third-party products, programs or services, their performance or compliance with your specifications or otherwise.

We will base any comments or recommendations as to the functional or technical capabilities of any products in use or being considered by you solely on information provided by your vendors, directly or through you. We are not responsible for the completeness or accuracy of any such information or for confirming any of it.

Where our written consent under the Agreement is required for you to disclose to a third party any of our Reports (other than Tax Advice), we will also require that third party to execute a letter substantially in the form of Appendix B to this SOW.

Timetable

Unless otherwise agreed, and subject to the General Terms and Conditions of the Agreement, we expect to perform the Services during the period from September 24th, 2018 to November 2nd, 2018. The services performed will be scheduled as follows:


Fees

The General Terms and Conditions of the Agreement address our fees and expenses generally.

Our fees for the Services as currently contemplated will be fixed at $ 62,000 CAD with a breakdown below:



These do not include any expenses or applicable taxes. Any additional fees or out-of-pocket expenses for items such as travel, meals, accommodation and other matters specifically related to your engagement will only be invoiced after acceptance and approval from BUYER. This fee estimate assumes that (i) SUPPLIER will be provided with timely access to all appropriate information and assistance (for instance, Client stakeholders and Key resources will be available to help coordinate Client's project and attend meetings and interviews); (ii) the scope and complexity of SUPPLIER's services are consistent with our prior discussions and the scope description set out in this SOW; If, during the term of this Agreement, SUPPLIER determines that our fee estimate will be significantly exceeded SUPPLIER will promptly contact Client to discuss any adjustments to the scope of our work or our fees.

SUPPLIER's fees, expenses and any applicable taxes will be invoiced monthly as time and expenses are incurred. Payment of SUPPLIER's invoices is due upon receipt. Interest on overdue accounts accrues at 12% per annum starting 30 days following the date of our invoice.

Please indicate your agreement with the terms of this engagement by executing this SOW in the space provided below and returning it to so that we may start work on this project.

Yours very truly,


Agreed:
BUYER

Per,	 Name:
Title:
APPENDIX A: GENERAL TERMS AND CONDITIONS

Our relationship with you
We will perform the Services in accordance with applicable professional standards.
We are a member of the global network of SUPPLIER firms (“SUPPLIER Firms”), each of which is a separate legal entity.
We will provide the Services to you as an independent contractor and not as your employee, agent, partner or joint venture. Neither you nor we have any right, power or authority to bind the other.
Upon written approval, we may subcontract portions of the Services to other SUPPLIER Firms, as well as to other service providers, who may deal with you directly. Nevertheless, we alone will be responsible to you for the Reports (as defined in Section 11), the performance of the Services, and our other obligations under this Agreement.
We will not assume any of your management responsibilities in connection with the Services. We will not be responsible for the use or implementation of the output of the Services.

Your responsibilities
You shall assign a qualified person to oversee the Services. You are responsible for all management decisions relating to the Services, the use or implementation of the output of the Services and for determining whether the Services are appropriate for your purposes.
You shall provide (or cause others to provide) to us, promptly, the information, resources and assistance (including access to records, systems, premises and people) that we reasonably require to perform the Services.
To the best of your knowledge, all information provided by you or on your behalf (“Client Information”) will be accurate and complete in all material respects. The provision of Client Information to us will not infringe any copyright or other third-party rights.
We will rely on Client Information made available to us and, unless we expressly agree otherwise, will have no responsibility to evaluate or verify it.
You shall be responsible for your personnel’s compliance with your obligations under this Agreement.

Our reports
Any information, advice, recommendations or other content of any reports, presentations or other communications we provide under this Agreement (“Reports”), other than Client Information, are for your internal use only (consistent with the purpose of the particular Services).
You may not disclose a Report (or any portion or summary of a Report) externally (including to your affiliates) or refer to us or to any other SUPPLIER Firm in connection with the Services, except:
to your lawyers (subject to these disclosure restrictions), who may review it only to give you advice relating to the Services,
to the extent, and for the purposes, required by law, regulation, rules of professional conduct or rules and policies of securities exchanges or commissions (and you will promptly notify us of any such requirement, to the extent you are permitted by law to do so),
to other persons (including your affiliates) with our prior written consent, who have executed an access letter substantially in the form we prescribe, or
To the extent it contains Tax Advice, as set forth in Section 13.
If you are permitted to disclose a Report (or a portion thereof) externally, you shall not alter, edit or modify it from the form we provided.
You may disclose to anyone a Report (or a portion thereof) solely to the extent that it relates to tax matters, including tax advice, tax opinions, tax returns, or the tax treatment or tax structure of any transaction to which the Services relate (“Tax Advice”). With the exception of tax authorities, you shall inform those to whom you disclose Tax Advice that they may not rely on it for any purpose without our prior written consent.
You may incorporate into documents that you intend to disclose externally SUPPLIER summaries, calculations or tables based on Client Information contained in a Report, but not our recommendations, conclusions or findings. However, you must assume sole responsibility for the contents of those documents and not refer to us or any other SUPPLIER Firm in connection with them. This provision does not affect your ability to circulate Reports internally.
You may not rely on any draft Report. We shall not be required to update any final Report for circumstances of which we become aware, or events occurring, after its delivery.

Notice re: Québec
From time to time, we may have individual partners and employees performing the Services who are members of the Ordre des comptables professionnels agréés du Québec (the “Québec Order”). Any individual member of the Québec Order practising the profession of chartered professional accountant assumes full personal civil liability arising therefrom, regardless of his or her status within our organization. He or she may not invoke the liability of our organization as a ground for excluding or limiting his or her own personal liability for the practice of the profession. The sections that follow below under the heading "Limitations" shall not apply to limit the personal civil liability of individual members of the Québec Order arising from their practice of the chartered professional accountant profession (and to such extent, shall be deemed to not be included in this Agreement).
Limitations
Neither party (or any others for whom Services are provided) may recover from the other, in contract or tort (including negligence), under statute or otherwise, any consequential, incidental, indirect, punitive or special damages in connection with claims arising out of this Agreement or otherwise relating to the Services, including any amount for loss of profit, data or goodwill, whether or not the likelihood of such loss or damage was contemplated.
Our total aggregate liability to you (and any others for whom Services are provided) for any loss or damage arising out of or relating to this Agreement or the Services shall be limited to the amount of the fees you have paid us for the particular Services directly giving rise to such loss or damage. This limitation applies regardless of whether our liability arises under contract, tort (including negligence), statute or otherwise. This limitation will not limit liability for loss or damage caused by our gross negligence, fraud or willful misconduct and will not apply to the extent prohibited by applicable law or professional regulations. For greater certainty, the term "gross negligence" as used above means the intentional failure to perform a manifest duty in reckless disregard of the consequences.If we are liable to you (or to any others for whom Services are provided) under this Agreement or otherwise in connection with the Services, for loss or damage to which any other persons have also contributed, our liability to you shall be several and not joint and several, solidary or in solidum, with such others, and shall be limited to our fair share of that total loss or damage, based on our contribution to the loss and damage relative to the others’ contributions. No exclusion or limitation on the liability of other responsible persons imposed or agreed at any time shall affect any assessment of our proportionate liability hereunder, nor shall settlement of or difficulty enforcing any claim, or the death, dissolution or insolvency of any such other responsible persons or their ceasing to be liable for the loss or damage or any portion thereof, affect any such assessment. This section does not apply to other SUPPLIER Firms or other service providers to which we have subcontracted per section 4 of these Terms and Conditions. In accordance with section 21, SUPPLIER shall be solely responsible for acts and omissions of other SUPPLIER Firms or other service providers to which we have subcontracted.
You shall make any claim relating to the Services or otherwise under this Agreement no later than one year after you became aware (or ought reasonably to have become aware) of the facts giving rise to any alleged such claim and in any event, no later than two years after the completion of the particular Services (and the parties agree that the limitation periods established by the Limitations Act, 2002 (Ontario) or any other applicable legislation shall be varied and/or excluded accordingly). This limitation will not apply to the extent prohibited by applicable law or professional regulations.
You may not make a claim or bring proceedings relating to the Services or otherwise under this Agreement against any other SUPPLIER Firm or our or its subcontractors, members, shareholders, directors, officers, partners, principals or employees ("SUPPLIER Persons"). You shall make any claim or bring proceedings only against us. Sections 17 through 20 and this Section 21 are intended to benefit the other SUPPLIER Firms and all SUPPLIER Persons, who shall be entitled to rely on and enforce them.

Indemnity
To the fullest extent permitted by applicable law and professional regulations, you shall indemnify and hold harmless SUPPLIER, the other SUPPLIER Firms and the SUPPLIER Persons from and against all claims by third parties (including your affiliates and lawyers) and resulting liabilities, losses, damages, costs and expenses (including reasonable external and internal legal costs) arising out of the disclosure of any Report (other than Tax Advice) or such third parties’ use of or reliance on any Reports (including Tax Advice) disclosed to them by you or at your request. We hereby agree to indemnify and hold harmless BUYER (including its respective directors, officers, employees and agents) from and against all losses, claims, costs, damages, demands, expenses (including legal fees and expenses) and liabilities of any kind or nature whatsoever which BUYER (including its directors, officers, employees and agents) may suffer, incur or be the subject of and which are in any way caused or derived, directly or indirectly, by reason of, from or in consequence of any failure on the part of SUPPLIER to pay taxes properly owed to applicable government tax authorities.


Intellectual property rights
We may use data, software, designs, utilities, tools, models, systems and other methodologies and know-how that we own or license (“Materials”) in performing the Services. Notwithstanding the delivery of any Reports, we retain all intellectual property rights in the Materials (including any improvements or knowledge developed while performing the Services), and in any working papers compiled in connection with the Services (but not Client Information reflected in them).
Upon payment for the Services, you may use any Materials included in the Reports, as well as the Reports themselves, solely as permitted by this Agreement.

Confidentiality
Except as otherwise permitted by this Agreement, neither of us may disclose to third parties the contents of this Agreement or any information (other than Tax Advice) provided by or on behalf of the other that ought reasonably to be treated as confidential and/or proprietary. Either of us may, however, disclose such information to the extent that it:
is or becomes public other than through a breach of this Agreement,
is subsequently received by the recipient from a third party who, to the recipient’s knowledge, owes no obligation of confidentiality to the disclosing party with respect to that information,
was known to the recipient at the time of disclosure or is thereafter created independently,
is disclosed as necessary to enforce the recipient’s rights under this Agreement, or
Must be disclosed under applicable law, legal process, securities laws or regulations, or professional regulations.
Either of us may use electronic media to correspond or transmit information and such use will not in itself constitute a breach of any confidentiality obligations under this Agreement.
We may provide Client Information to other SUPPLIER Firms (which are listed at www.SUPPLIER.com), SUPPLIER Persons, and service providers to SUPPLIER and other SUPPLIER Firms, all of whom may collect, use, transfer, store or otherwise process (collectively “Process”) it in various jurisdictions in which we and they operate in order to facilitate performance of the Services, to comply with regulatory requirements, to check conflicts, to provide technology or administrative services, or for quality, risk management or financial accounting purposes. We shall be responsible to you for maintaining the confidentiality of Client Information, regardless of where or by whom such information is processed on our behalf.
With respect to any Services, if U.S. Securities and Exchange Commission auditor independence requirements apply to the relationship between you or any of your associated entities and any SUPPLIER Firm, you represent, to the best of your knowledge, as of the date of this Agreement and as of the date of each Statement of Work hereunder, that neither you nor any of your affiliates has agreed, either orally or in writing, with any other advisor to restrict your ability to disclose to anyone the tax treatment or tax structure of any transaction to which the Services relate. An agreement of this kind could impair an SUPPLIER Firm’s independence as to your audit or that of any of your affiliates, or require specific tax disclosures as to those restrictions. Accordingly, you agree that the impact of any such agreement is your responsibility.
Data protection
SUPPLIER, the other SUPPLIER Firms and our respective service providers may Process Client Information that can be linked to specific individuals (“Personal Data”) in various jurisdictions in which we and they operate, for the purposes described in section 27. All Personal Data will be processed in accordance with applicable law and professional regulations including the EU General Data Protection Regulation, to the extent we obtain access to the Personal Data of European Union or European Economic Area residents. We will require any service provider that Processes Personal Data on our behalf to adhere to such requirements and we shall be responsible to you for maintaining the confidentiality of Personal Data, regardless of where or by whom such Personal Data is processed on our behalf. Our Canadian privacy policy is available at www.SUPPLIER.com/ca.
You warrant that you have the authority to provide the Personal Data to us in connection with the performance of the Services and that the Personal Data provided to us has been processed in accordance with applicable law.
Fees and expenses generally
You shall pay our professional fees and specific expenses in connection with the Services as detailed in the applicable Statement of Work. You shall also reimburse us for other reasonable expenses incurred in performing the Services which were approved by you prior to being incurred by SUPPLIER. Our fees are exclusive of taxes or similar charges, as well as customs, duties or tariffs imposed in respect of the Services, all of which you shall pay (other than taxes imposed on our income generally). Unless otherwise set forth in the applicable Statement of Work, payment is due within 30 days following receipt of each of our invoices.
We may charge additional professional fees as reasonable if events beyond our control (including your acts or omissions) affect our ability to perform the Services as originally planned or if you ask us to perform additional tasks.
If we are required by applicable law, legal process or government action to produce information or personnel as witnesses with respect to the Services or this Agreement, you shall reimburse us for any professional time and expenses (including reasonable external and internal legal costs) incurred to respond to the request, unless we are a party to the proceeding or the subject of the investigation.

Force majeure
Neither you nor we shall be liable for breach of this Agreement (other than payment obligations) caused by circumstances bSUPPLIERond your or our reasonable control.

Term and termination
This Agreement applies to the Services whenever performed.
This Agreement shall terminate upon the completion of the Services. Either of us may terminate it, or any particular Services, earlier upon 30 days' prior written notice to the other. In addition, we may terminate this Agreement, or any particular Services, immediately upon written notice to you if we reasonably determine that we can no longer provide the Services in accordance with applicable law or professional obligations. You may also terminate the agreement immediately upon written notice in the event you reasonably determine that we have breached a material aspect of this Agreement.
You shall pay us for all work-in-progress, Services already performed, and expenses incurred by us up to and including the effective date of the termination of this Agreement. Payment is due within 30 days following receipt of our invoice for these amounts.
The provisions of this Agreement, including Section 14 and otherwise with respect to Reports, that give either of us rights or obligations beyond its termination shall continue indefinitely following the termination of this Agreement, except that our respective confidentiality obligations (other than those relating to Reports or under Section 14) shall continue thereafter for three years only.

Governing law and dispute resolution
This Agreement, and any non-contractual matters or obligations arising out of this Agreement or the Services, shall be governed by, and construed in accordance with, the laws of the Province of Quebec and the laws of Canada applicable therein, without regard to principles of conflicts of law. Any dispute, claim or other matter arising out of or relating to this Agreement or the Services shall be subject to the exclusive jurisdiction of the Quebec courts, to which each of us agrees to submit for these purposes.

Miscellaneous
This Agreement constitutes the entire agreement between us as to the Services and the other matters it covers, and supersedes all prior agreements, understandings and representations with respect thereto, including any confidentiality agreements previously delivered.
Both of us may execute this Agreement (including Statements of Work), as well as any modifications thereto, by electronic means and each of us may sign a different copy of the same document. Both of us must agree in writing to modify this Agreement or any Statement of Work hereunder.
Each of us represents to the other that each person signing this Agreement or any Statement of Work hereunder on its behalf is expressly authorized to execute it and to bind such party to its terms. You also represent that this Agreement has, if necessary, been considered and approved by your Audit Committee. You represent that any others for whom Services are provided shall be bound by the terms of this Agreement and the applicable Statement of Work.
You agree that we and the other SUPPLIER Firms may, subject to professional obligations, act for other clients, including your competitors.
Neither of us may assign any of our rights, obligations or claims arising out of or related to this Agreement or any Services.
If any provision of this Agreement (in whole or part) is held to be illegal, invalid or otherwise unenforceable, the other provisions shall remain in full force and effect.
If there is any inconsistency between provisions in different parts of this Agreement, those parts shall have precedence as follows (unless expressly agreed otherwise): (a) the Cover Letter, (b) the applicable Statement of Work and any attachments thereto, (c) these General Terms and Conditions, and (d) other attachments to this Agreement.
Neither of us may use or reference the other’s name, logos or trademarks publicly without the other’s prior written consent, although we may publicly identify you as a client in connection with specific Services or generally.
Without limiting any other terms of this Agreement, the provisions of Sections 22, 27, 29 and 43 are intended to benefit the other SUPPLIER Firms and all SUPPLIER Persons, who shall be entitled to rely on and enforce them.
For administrative reasons, you may from time to time ask that fees and expenses for Services performed for your international affiliates or at international locations be invoiced to you or your designate there, in local currency. You guarantee the timely payment of all those invoices by your affiliates. In addition, from time-to-time other SUPPLIER Firms providing Services as our subcontractors may bill you directly for fees and expenses incurred for work performed outside of Canada (in local currency or otherwise).
Where you have engaged the Canadian firm of SUPPLIER, please note the following. We are a registered limited liability partnership ("LLP") continued under the laws of the province of Ontario and we are registered as an extra-provincial LLP in Quebec and other Canadian provinces. Generally, an LLP partner is not personally liable for the debts, obligations or liabilities of the LLP arising from the negligence of persons not under his or her direct supervision (including other LLP partners) or most other debts or obligations of the LLP. As an LLP, we are required to maintain certain insurance. Our insurance exceeds the mandatory professional liability insurance requirements established by any provincial Institute of Chartered Accountants/Order of Chartered Professional Accountants.
    `,
    payload: {
      deliverables: [
        {
          title: "Project initiation kick-off deck",
          activities: [
            "Identify interviewees and establish interview schedules if necessary",
            "Request and collect relevant documentation including security assessments, governance structure, policies, standards, etc.",
            "Create project kick-off deck",
            "Conduct kick-off meeting to review objectives, refine approach and set project milestones",
          ],
        },
        {
          title: "Benchmark analysis",
          activities: [
            "Create a maturity assessment questionnaires",
            "Distribute maturity assessment questionnaires to industry competitors",
            "Conduct stakeholder interviews to understand current profile based on cybersecurity maturity framework",
            "Perform a mapping between the current state and the competitors",
            "Perform a mapping between the current profile and the cybersecurity maturity framework",
            "Identify gaps against competitors",
            "Identify gaps against cybersecurity maturity framework",
            "Conduct stakeholder interviews to define where the improvement focus must be",
            "Recommend how to achieve the desired cybersecurity maturity ",
            "Summarize the current state assessment with the next steps in prioritized order",
          ],
        },
        {
          title: "Threat risk assessment report",
          activities: [
            "Analyze cyber threat landscape and associated risks",
            "Map identified risks against threat landscape",
            "Compile a cyber threat risk report detailing the impact of threats",
          ],
        },
        {
          title: "Risk management methodology report",
          activities: [
            "Review existing risk management methodology documentation and processes",
            "Perform gap assessment against industry to identify both negative and positive assurance",
            "Assess methodology against cybersecurity maturity framework to determine if any controls are missing",
            "Identify any risks in a risk log",
            "Provide recommendations on methodology",
          ],
        },
        {
          title: "Roadmap & risk universe recommendations",
          activities: [
            "Review existing cybersecurity roadmap",
            "Review identified cyber threat risks",
            "Provide roadmap and risk universe recommendations for prioritization",
          ],
        },
        {
          title: "Executive summary",
          activities: [
            "Document restitution",
            "Document sign-off",
            "Document approvals",
            "Move versions from draft to final",
          ],
        },
      ],
    },
  },
];

main(documents).catch((err) => {
  console.error("An error occurred:", err);
});

