function Item({ valid, text }) {

    return (

        <div className={`password-check ${valid ? "valid" : "invalid"}`}>

            <span>

                {valid ? "✓" : "✕"}

            </span>

            {text}

        </div>

    );

}

function PasswordRequirements({ password }) {

    const checks = {

        length: password.length >= 8,

        upper: /[A-Z]/.test(password),

        lower: /[a-z]/.test(password),

        number: /\d/.test(password),

        special: /[@$!%*?&^#()_+\-=]/.test(password)

    };

    return (

        <div className="password-requirements">

            <h4>Password Requirements</h4>

            <Item
                valid={checks.length}
                text="At least 8 characters"
            />

            <Item
                valid={checks.upper}
                text="One uppercase letter"
            />

            <Item
                valid={checks.lower}
                text="One lowercase letter"
            />

            <Item
                valid={checks.number}
                text="One number"
            />

            <Item
                valid={checks.special}
                text="One special character"
            />

        </div>

    );

}

export default PasswordRequirements;