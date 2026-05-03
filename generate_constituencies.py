import json

# Representative data for major states
data = {
    "Uttar Pradesh": [
        {"name": "Varanasi", "mp": "Narendra Modi", "party": "BJP", "voteShare": 54.2, "turnout": 56.4, "category": "General"},
        {"name": "Rae Bareli", "mp": "Rahul Gandhi", "party": "INC", "voteShare": 66.2, "turnout": 58.1, "category": "General"},
        {"name": "Lucknow", "mp": "Rajnath Singh", "party": "BJP", "voteShare": 53.5, "turnout": 52.2, "category": "General"},
        {"name": "Amethi", "mp": "Kishori Lal", "party": "INC", "voteShare": 54.9, "turnout": 54.3, "category": "General"},
        {"name": "Faizabad", "mp": "Awadhesh Prasad", "party": "SP", "voteShare": 48.6, "turnout": 59.1, "category": "SC"}
    ],
    "Maharashtra": [
        {"name": "Nagpur", "mp": "Nitin Gadkari", "party": "BJP", "voteShare": 54.1, "turnout": 54.3, "category": "General"},
        {"name": "Baramati", "mp": "Supriya Sule", "party": "NCP (SP)", "voteShare": 51.3, "turnout": 59.5, "category": "General"},
        {"name": "Mumbai North", "mp": "Piyush Goyal", "party": "BJP", "voteShare": 65.7, "turnout": 57.0, "category": "General"},
        {"name": "Nanded", "mp": "Vasantrao Chavan", "party": "INC", "voteShare": 46.8, "turnout": 60.9, "category": "General"},
        {"name": "Nashik", "mp": "Rajabhau Waje", "party": "SHS (UBT)", "voteShare": 48.4, "turnout": 60.7, "category": "General"}
    ],
    "West Bengal": [
        {"name": "Diamond Harbour", "mp": "Abhishek Banerjee", "party": "TMC", "voteShare": 55.6, "turnout": 81.2, "category": "General"},
        {"name": "Asansol", "mp": "Shatrughan Sinha", "party": "TMC", "voteShare": 46.5, "turnout": 73.3, "category": "General"},
        {"name": "Darjeeling", "mp": "Raju Bista", "party": "BJP", "voteShare": 51.2, "turnout": 74.8, "category": "General"},
        {"name": "Baharampur", "mp": "Yusuf Pathan", "party": "TMC", "voteShare": 47.8, "turnout": 80.1, "category": "General"},
        {"name": "Krishnanagar", "mp": "Mahua Moitra", "party": "TMC", "voteShare": 44.1, "turnout": 80.6, "category": "General"}
    ],
    "Tamil Nadu": [
        {"name": "Chennai South", "mp": "Thamizhachi Thangapandian", "party": "DMK", "voteShare": 47.0, "turnout": 54.3, "category": "General"},
        {"name": "Coimbatore", "mp": "Ganapathi P. Rajkumar", "party": "DMK", "voteShare": 44.5, "turnout": 64.8, "category": "General"},
        {"name": "Thoothukudi", "mp": "Kanimozhi Karunanidhi", "party": "DMK", "voteShare": 55.3, "turnout": 59.9, "category": "General"},
        {"name": "Sivaganga", "mp": "Karti P. Chidambaram", "party": "INC", "voteShare": 51.2, "turnout": 64.3, "category": "General"},
        {"name": "Madurai", "mp": "Su. Venkatesan", "party": "CPI(M)", "voteShare": 43.6, "turnout": 62.0, "category": "General"}
    ]
}

# Fill in with more states to reach ~543 or a good distribution
states = [
    ("Bihar", 40, "BJP"), ("Karnataka", 28, "BJP"), ("Gujarat", 26, "BJP"), 
    ("Rajasthan", 25, "BJP"), ("Andhra Pradesh", 25, "TDP"), ("Madhya Pradesh", 29, "BJP"),
    ("Odisha", 21, "BJP"), ("Kerala", 20, "INC"), ("Telangana", 17, "INC"),
    ("Assam", 14, "BJP"), ("Jharkhand", 14, "BJP"), ("Punjab", 13, "INC"),
    ("Chhattisgarh", 11, "BJP"), ("Haryana", 10, "BJP"), ("Delhi", 7, "BJP"),
    ("Uttarakhand", 5, "BJP"), ("Jammu & Kashmir", 5, "JKNC"), ("Himachal Pradesh", 4, "BJP"),
    ("Tripura", 2, "BJP"), ("Arunachal Pradesh", 2, "BJP"), ("Goa", 2, "INC"),
    ("Manipur", 2, "INC"), ("Meghalaya", 2, "VPP"), ("Nagaland", 1, "INC"),
    ("Sikkim", 1, "SKM"), ("Mizoram", 1, "ZPM"), ("Chandigarh", 1, "INC"),
    ("Andaman & Nicobar Islands", 1, "BJP"), ("Lakshadweep", 1, "INC"),
    ("Puducherry", 1, "INC"), ("Dadra & Nagar Haveli and Daman & Diu", 2, "BJP")
]

for state, count, dominant in states:
    if state not in data:
        data[state] = []
    
    # Add representative constituencies up to the actual seat count
    for i in range(1, count + 1):
        data[state].append({
            "name": f"{state} Constituency {i}",
            "mp": f"Candidate {i}",
            "party": dominant if i % 3 != 0 else ("INC" if dominant != "INC" else "BJP"),
            "voteShare": round(45.0 + (i * 0.13) % 15, 1),
            "turnout": round(60.0 + (i * 0.17) % 20, 1),
            "category": "General" if i % 7 != 0 else "SC"
        })

# Ensure all states in CONSTITUENCY_DATA are covered
with open('public/data/constituencies.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Generated constituencies.json")
