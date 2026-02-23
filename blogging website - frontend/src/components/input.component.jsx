import { useState } from "react";

const InputBox = ({ name, type, value, placeholder, icon, id }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    return (
        <div className="relative w-full mb-4">
            <input
                name={name}
                type={type === "password" ? (passwordVisible ? "text" : "password") : type}
                placeholder={placeholder}
                defaultValue={value}
                id={id} 
                className="input-box"
            />

            <i className={`fi ${icon} input-icon`}></i>

            {type === "password" ? 
                <i 
                    className={"fi fi-rr-eye" + (!passwordVisible ? "-crossed" : "") + " input-icon left-[auto] right-4 cursor-pointer"}
                    onClick={() => setPasswordVisible(currentVal => !currentVal)}  
                ></i>
                : ""
            }
        </div>
    );
};

export default InputBox;
