def get_salary():
    while True:
        user_input = input("Enter your monthly salary: ")
        try:
            salary = float(user_input)
            if salary <= 0:
                print("Salary must be a positive number. Try again.")
                continue
            return salary
        except ValueError:
            print("That doesn't look like a valid number. Try again.")

def get_percentage(label, default):
    user_input = input(f"{label} % (press Enter to use default {default}%): ")
    if user_input.strip() == "":
        return default
    try:
        value = float(user_input)
        return value
    except ValueError:
        print("Invalid entry, using default.")
        return default

def get_all_percentages():
    print("\nCustomize your plan (or press Enter to keep the suggested %):")
    savings_pct = get_percentage("Savings", 20)
    rent_pct = get_percentage("Rent", 28)
    food_pct = get_percentage("Food", 17)
    transport_pct = get_percentage("Transport", 15)
    other_pct = get_percentage("Other", 20)

    total = savings_pct + rent_pct + food_pct + transport_pct + other_pct

    if total != 100:
        print(f"\nNote: your percentages add up to {total}%, not 100%.")
        print("Adjusting 'Other' automatically to make it balance.")
        other_pct = other_pct + (100 - total)

    return savings_pct, rent_pct, food_pct, transport_pct, other_pct

def generate_plan(salary, savings_pct, rent_pct, food_pct, transport_pct, other_pct):
    savings = round(salary * savings_pct / 100, 2)
    rent = round(salary * rent_pct / 100, 2)
    food = round(salary * food_pct / 100, 2)
    transport = round(salary * transport_pct / 100, 2)
    other = round(salary * other_pct / 100, 2)

    essential_expenses = rent + food + transport
    essential_pct = round((essential_expenses / salary) * 100, 1)

    print("\nYour Personalized Spending Plan")
    print("Monthly Salary: ₹", salary)
    print("-" * 40)
    print(f"Savings:    ₹{savings:>10}  ({savings_pct:.0f}%)")
    print(f"Rent:       ₹{rent:>10}  ({rent_pct:.0f}%)")
    print(f"Food:       ₹{food:>10}  ({food_pct:.0f}%)")
    print(f"Transport:  ₹{transport:>10}  ({transport_pct:.0f}%)")
    print(f"Other:      ₹{other:>10}  ({other_pct:.0f}%)")
    print("-" * 40)
    print(f"Total essential expenses: ₹{essential_expenses} ({essential_pct}%)")

salary = get_salary()
savings_pct, rent_pct, food_pct, transport_pct, other_pct = get_all_percentages()
generate_plan(salary, savings_pct, rent_pct, food_pct, transport_pct, other_pct)
