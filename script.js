let allElements = []
let createElementBtn = document.querySelector('.create-element-btn')
let canvas = document.querySelector('.canvas')
let resizeHandles = document.querySelector('.border-div')
let currentZIndex = 0
let canvasDimensions = canvas.getBoundingClientRect()



let state = {
    selectedElement: null,
    selectedTool: 'rectangle',
    isSelection: false,
    isResizing: false,
    isDragging: false
}
let startWidth = 0
let startHeight = 0
let startMouseX = 0
let startMouseY = 0


function showSelectedElement(e) {
    state.isSelection = true
    e.stopPropagation();
    state.selectedElement = e.srcElement
    let selectedElementDetails = e.srcElement.getBoundingClientRect();
    let selectedElementZIndex = window.getComputedStyle(e.srcElement).zIndex
    console.log(selectedElementZIndex)
    positionResizeHandles(selectedElementDetails, selectedElementZIndex)
}
function deselectElement() {
    if (state.isSelection === false) return

    resizeHandles.style.display = 'none'
    resizeHandles.style.height = 0 + 'px'
    resizeHandles.style.width = 0 + 'px'
    resizeHandles.style.top = 0 + 'px'
    resizeHandles.style.left = 0 + 'px'
}
function positionResizeHandles(elementDetails, elementZIndex) {
    resizeHandles.style.display = 'block'
    resizeHandles.style.height = elementDetails.height + 2 + 'px'
    resizeHandles.style.width = (1 + elementDetails.width) + 'px'
    resizeHandles.style.top = elementDetails.top + 'px'
    resizeHandles.style.left = elementDetails.left - canvasDimensions.left + 'px'
    resizeHandles.style.zIndex = Number(elementZIndex) + 1
    //elementZindex was passsed as a string so we had to conver it in a number
}

function handleCanvasMouseEvents(e) {
    if (state.isSelection == true) {
        deselectElement()
    }
}

canvas.addEventListener('click', handleCanvasMouseEvents)



//-------------------------------------------------------------------------------------------------------
//Function to create the rectangle
//-------------------------------------------------------------------------------------------------------
function createRectangle() {

    function FinishRectangleCreation(e) {

        canvas.removeEventListener('mousemove', calculateRectSize)
        canvas.removeEventListener('mouseup', FinishRectangleCreation)

        if (state.isDragging && state.selectedElement) {
            allElements.push(state.selectedElement)
            state.selectedElement.classList.add('element')
            state.selectedElement.id = allElements.length - 1
            state.selectedElement.addEventListener('click', showSelectedElement)
            state.isDragging = false
        }

    }

    function calculateRectSize(e) {
        let rectangle = state.selectedElement
        let deltaX = e.clientX - startMouseX
        let deltaY = e.clientY - startMouseY

        let newWidth = Math.abs(deltaX)
        let newHeight = Math.abs(deltaY)

        // In case if the delta is negative we need to reposition the Top and left reference of the element
        if (state.isDragging && deltaX < 0) {
            rectangle.style.left = (e.clientX - canvasDimensions.left) + 'px'
        }
        if (state.isDragging && deltaY < 0) {
            rectangle.style.top = (e.clientY - canvasDimensions.top) + 'px'
        }

        rectangle.style.width = newWidth + 'px'
        rectangle.style.height = newHeight + 'px'
    }


    function createRectByDragging(e) {
        state.isDragging = true
        let newRect = document.createElement('div')
        startMouseX = e.clientX
        startMouseY = e.clientY
        startWidth = 0
        startHeight = 0
        newRect.style.position = 'absolute'
        newRect.style.background = 'red'
        newRect.style.top = (startMouseY - canvasDimensions.top) + 'px'
        newRect.style.left = (startMouseX - canvasDimensions.left) + 'px'
        newRect.style.width = '0px'
        newRect.style.height = '0px'
        newRect.style.zIndex = currentZIndex
        currentZIndex++
        state.selectedElement = newRect
        canvas.appendChild(state.selectedElement)
        canvas.addEventListener('mousemove', calculateRectSize)
        canvas.addEventListener('mouseup', FinishRectangleCreation)
        canvas.removeEventListener('mousedown', createRectByDragging)
    }
    canvas.addEventListener('mousedown', createRectByDragging)
}

createElementBtn.addEventListener('click', () => {
    if (state.selectedTool == 'rectangle') {

        createRectangle()


    }
})











