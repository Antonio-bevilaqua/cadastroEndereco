/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */




class Input {
    constructor(element, masks = [], callback = null) {
        this.element = element;
        this.masks = [];
        this.value = element.value;
        this.callback = callback;

        for (let mask of masks) {
            if (typeof this[mask + "Mask"] === "function") {
                this.masks.push(mask);
            }
        }
        this.setListeners();
    }

    setListeners() {
        this.element.addEventListener("input", this.onChange.bind(this));
    }

    val(value) {
        this.value = value;
        this.element.value = value;
    }

    onChange(e) {
        this.value = e.target.value;

        for (let mask of this.masks) {
            this[mask + "Mask"]();
        }

        e.target.value = this.value;

        if (typeof this.callback === "function") {
            this.callback(e.target);
        }
    }

    numberMask() {
        this.value = this.value.replace(/\D/g, "");
    }

    cepMask() {
        this.numberMask();
        this.value = this.value.length > 8
                ? this.value.substring(0, 8)
                : this.value;
        this.value = this.value.replace(/(\d{5})(\d)/, "$1-$2");
    }
}

class Controller {
    constructor() {
        this.form = document.querySelector("form");
        this.setInputs();
        this.nameMapper = {
            uf: "estado",
            localidade: "cidade",
            logradouro: "rua"
        };
    }

    setInputs() {
        this.inputs = {};
        const formInputs = [...this.form.querySelectorAll("input")];
        for (let input of formInputs) {
            let masks = input.hasAttribute("mask")
                    ? [input.getAttribute("mask")]
                    : [];
            let callback = input.name === "cep"
                    ? this.searchCep.bind(this)
                    : null;

            this.inputs[input.name] = (new Input(input, masks, callback));
        }
    }

    async searchCep(element) {
        const cep = element.value.replace(/\D/g, "");
        if (cep.length < 8) {
            return;
        }

        let url = `https://viacep.com.br/ws/${cep}/json/`;
        const dados = await fetch(url);
        const json = await dados.json();

        if (!this.responseHaveError(json)) {
            for (let key in json) {
                let name = (typeof this.nameMapper[key] !== "undefined")
                        ? this.nameMapper[key]
                        : key;

                if (typeof this.inputs[name] === 'undefined') {
                    continue;
                }
                this.inputs[name].val(json[key]);
            }
            this.enableInputs();
        }
    }

    responseHaveError(json) {
        if (typeof json.erro === 'undefined' || !json.erro) {
            return false;
        }
        alert("Cep não encontrado!");

        for (let name in this.inputs) {
            if (name === "cep") {
                continue;
            }
            this.inputs[name].val("");
        }

        this.enableInputs();
        return true;
    }

    enableInputs() {
        for (let name in this.inputs) {
            this.inputs[name].element.disabled = false;
        }
    }
}

const controller = new Controller();


