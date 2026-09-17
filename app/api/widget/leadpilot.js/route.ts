import { NextResponse } from "next/server";

export async function GET() {
  const script = `
(function() {
  var scriptTag = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var orgId = scriptTag ? scriptTag.getAttribute('data-org') : '';
  if (!orgId) {
    console.warn('LeadPilot AI: data-org attribute is missing on the script tag.');
    return;
  }

  var baseUrl = window.location.origin;
  if (scriptTag && scriptTag.src) {
    try {
      var url = new URL(scriptTag.src);
      baseUrl = url.origin;
    } catch(e) {}
  }

  // Inject styles
  var style = document.createElement('style');
  style.innerHTML = \`
    .leadpilot-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: #ffffff;
      padding: 14px 22px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .leadpilot-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5);
    }
    .leadpilot-modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999999;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .leadpilot-modal {
      background: #ffffff;
      border-radius: 16px;
      max-width: 440px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }
    .leadpilot-modal h3 {
      margin: 0 0 6px 0;
      font-size: 20px;
      font-weight: 700;
    }
    .leadpilot-modal p {
      margin: 0 0 20px 0;
      font-size: 13px;
      color: #64748b;
    }
    .leadpilot-form-group {
      margin-bottom: 14px;
    }
    .leadpilot-form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 5px;
    }
    .leadpilot-form-group input, .leadpilot-form-group select, .leadpilot-form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
    }
    .leadpilot-form-group input:focus, .leadpilot-form-group textarea:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }
    .leadpilot-submit-btn {
      width: 100%;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.2s ease;
    }
    .leadpilot-submit-btn:hover {
      background: #4338ca;
    }
    .leadpilot-close-btn {
      position: absolute;
      top: 18px;
      right: 18px;
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #94a3b8;
    }
    .leadpilot-badge {
      display: block;
      text-align: center;
      margin-top: 14px;
      font-size: 11px;
      color: #94a3b8;
      text-decoration: none;
    }
  \`;
  document.head.appendChild(style);

  // Inject trigger button
  var btn = document.createElement('button');
  btn.className = 'leadpilot-btn';
  btn.innerHTML = '<span>💬</span> <span>Enquire Property</span>';
  document.body.appendChild(btn);

  // Inject modal
  var backdrop = document.createElement('div');
  backdrop.className = 'leadpilot-modal-backdrop';
  backdrop.innerHTML = \`
    <div class="leadpilot-modal">
      <button class="leadpilot-close-btn" id="lp-close">&times;</button>
      <h3>Find Your Dream Property</h3>
      <p>Tell us your preferences and our verified consultants will connect with you.</p>
      <form id="lp-form">
        <!-- Anti-spam honeypot -->
        <input type="text" name="_hp_check" style="display:none !important;" tabindex="-1" autocomplete="off" />
        
        <div class="leadpilot-form-group">
          <label>Full Name *</label>
          <input type="text" name="name" placeholder="Rajesh Kumar" required />
        </div>
        <div class="leadpilot-form-group">
          <label>Phone Number (WhatsApp) *</label>
          <input type="tel" name="phone" placeholder="+91 98765 43210" required />
        </div>
        <div class="leadpilot-form-group">
          <label>Preferred Locality</label>
          <input type="text" name="location" placeholder="e.g. OMR, Velachery, Anna Nagar" />
        </div>
        <div class="leadpilot-form-group">
          <label>Requirement & Budget</label>
          <textarea name="requirement" rows="2" placeholder="e.g. 2BHK ready to move under 75 lakhs"></textarea>
        </div>
        <button type="submit" class="leadpilot-submit-btn" id="lp-submit">Send Enquiry</button>
      </form>
      <div id="lp-success" style="display:none; text-align:center; padding: 20px 0;">
        <h4 style="color:#10b981; margin-bottom:8px; font-size:18px;">Enquiry Received!</h4>
        <p style="color:#64748b; font-size:13px;">Our property advisor will contact you with matching verified listings shortly.</p>
      </div>
      <a href="https://leadpilot.ai" target="_blank" class="leadpilot-badge">⚡ Powered by LeadPilot AI</a>
    </div>
  \`;
  document.body.appendChild(backdrop);

  btn.onclick = function() {
    backdrop.style.display = 'flex';
  };

  backdrop.querySelector('#lp-close').onclick = function() {
    backdrop.style.display = 'none';
  };

  backdrop.onclick = function(e) {
    if (e.target === backdrop) backdrop.style.display = 'none';
  };

  var form = backdrop.querySelector('#lp-form');
  var successDiv = backdrop.querySelector('#lp-success');
  var submitBtn = backdrop.querySelector('#lp-submit');

  form.onsubmit = function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';

    var formData = new FormData(form);
    var payload = {
      organizationId: orgId,
      name: formData.get('name'),
      phone: formData.get('phone'),
      location: formData.get('location') || '',
      requirement: formData.get('requirement') || '',
      _hp_check: formData.get('_hp_check') || ''
    };

    fetch(baseUrl + '/api/public/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        setTimeout(function() {
          backdrop.style.display = 'none';
          form.reset();
          form.style.display = 'block';
          successDiv.style.display = 'none';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Send Enquiry';
        }, 4000);
      } else {
        alert(data.error || 'Failed to submit enquiry. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Enquiry';
      }
    })
    .catch(function() {
      alert('Error connecting to LeadPilot server.');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Send Enquiry';
    });
  };
})();
  `;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

