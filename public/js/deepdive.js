/**
 * VoteWise India — Deep Dive Section
 * "How Your Vote Is Counted" — EVMs and VVPATs
 */

const EVM_STEPS = [
  { icon: '🆔', title: '1. Identification', text: 'Polling officials verify your identity against the electoral roll and check your Voter ID or approved document.' },
  { icon: '👆', title: '2. Indelible Ink', text: 'Your left index finger is marked with indelible ink to prevent multiple voting.' },
  { icon: '📝', title: '3. Register', text: 'You sign or provide a thumb impression in Form 17A (Register of Voters).' },
  { icon: '🟢', title: '4. Ballot Ready', text: 'The Presiding Officer presses a button on the Control Unit, activating the Ballot Unit in the voting compartment.' },
  { icon: '🗳️', title: '5. Cast Vote', text: 'You press the blue button next to your chosen candidate\'s symbol on the Ballot Unit. A red light glows and a long beep sounds.' },
  { icon: '🧾', title: '6. VVPAT Verification', text: 'A paper slip prints in the VVPAT showing the candidate\'s serial number, name, and symbol. It is visible for 7 seconds before dropping into the sealed drop box.' }
];

function renderDeepDiveSection() {
  const stepsContainer = document.getElementById('deepdive-steps-container');
  if (!stepsContainer) return;

  stepsContainer.innerHTML = EVM_STEPS.map((step, index) => `
    <div class="deepdive-step">
      <div class="step-number-large">${index + 1}</div>
      <div class="step-icon">${step.icon}</div>
      <h4>${step.title}</h4>
      <p>${step.text}</p>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderDeepDiveSection);
